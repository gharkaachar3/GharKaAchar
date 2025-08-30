const Order = require('../Model/order');
const User = require('../Model/User');
const axios = require('axios');
const crypto = require('crypto');

// Cashfree config
const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  baseUrl: process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg',
  apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01'
};

// Helper function to generate Cashfree headers
function getCashfreeHeaders() {
  return {
    'X-Client-Id': CASHFREE_CONFIG.appId,
    'X-Client-Secret': CASHFREE_CONFIG.secretKey,
    'X-API-Version': CASHFREE_CONFIG.apiVersion,
    'Content-Type': 'application/json'
  };
}

// Create Order
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const {
      userName,
      phone,
      address,
      items,
      paymentMethod, // 'cashfree' or 'cod'
      orderNotes,
      specialInstructions,
      deliveryPreferences
    } = req.body;

    // Validation
    if (!userName || !phone || !address || !items || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!['cashfree', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const shippingCost = paymentMethod === 'cod' ? 75 : 50;
    const codCharges = paymentMethod === 'cod' ? 25 : 0;
    const totalAmount = subtotal + shippingCost;

    // Create order object
    const orderData = {
      userId,
      userName,
      phone,
      address,
      items,
      subtotal,
      shippingCost,
      codCharges,
      totalAmount,
      paymentMethod,
      orderNotes,
      specialInstructions,
      deliveryPreferences,
      orderStatus: 'created'
    };

    // Handle COD orders
    if (paymentMethod === 'cod') {
      orderData.paymentStatus = 'cod';
      orderData.orderStatus = 'confirmed';
      
      const order = new Order(orderData);
      await order.save();

      return res.status(201).json({
        success: true,
        message: "COD order placed successfully",
        order: {
          orderId: order.orderId,
          totalAmount: order.totalAmount,
          paymentMethod: 'cod',
          orderStatus: order.orderStatus
        }
      });
    }

    // Handle Cashfree orders
    if (paymentMethod === 'cashfree') {
      try {
        // Generate a unique order ID
        const cashfreeOrderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
        
        // Create Cashfree order
        const cashfreeOrderData = {
          order_id: cashfreeOrderId,
          order_amount: totalAmount,
          order_currency: 'INR',
          customer_details: {
            customer_id: userId,
            customer_name: userName,
            customer_email: user.email || `user${userId}@example.com`,
            customer_phone: phone
          },
          order_meta: {
            return_url: `${process.env.FRONTEND_URL}/payment-callback?order_id=${cashfreeOrderId}`,
            notify_url: `${process.env.BACKEND_URL}/cashfree/webhook`
          }
        };

        console.log('Creating Cashfree order:', cashfreeOrderData);

        const cashfreeResponse = await axios.post(
          `${CASHFREE_CONFIG.baseUrl}/orders`,
          cashfreeOrderData,
          { headers: getCashfreeHeaders() }
        );

        if (cashfreeResponse.data && cashfreeResponse.data.order_id) {
          // Save order with pending payment
          orderData.cashfreeOrderId = cashfreeResponse.data.order_id;
          orderData.paymentStatus = 'pending';
          
          const order = new Order(orderData);
          await order.save();

          return res.status(201).json({
            success: true,
            message: "Order created, proceed to payment",
            order: {
              orderId: order.orderId,
              cashfreeOrderId: cashfreeResponse.data.order_id,
              paymentSessionId: cashfreeResponse.data.payment_session_id,
              totalAmount: order.totalAmount,
              paymentMethod: 'cashfree'
            }
          });
        } else {
          throw new Error('Invalid Cashfree response');
        }

      } catch (cashfreeError) {
        console.error('Cashfree order creation failed:', cashfreeError.response?.data || cashfreeError.message);
        return res.status(500).json({
          success: false,
          message: "Payment gateway error. Please try again.",
          error: cashfreeError.response?.data || cashfreeError.message
        });
      }
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
}

// Cashfree Webhook Handler - UPDATED TO NOT SAVE FAILED PAYMENTS
async function handleCashfreeWebhook(req, res) {
  try {
    const { order_id, payment_status, cf_payment_id, order_amount } = req.body;

    console.log('Cashfree webhook received:', req.body);

    // Find order by Cashfree order ID
    const order = await Order.findOne({ cashfreeOrderId: order_id });
    if (!order) {
      console.log('Order not found for Cashfree ID:', order_id);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Handle payment success
    if (payment_status === 'SUCCESS') {
      order.paymentStatus = 'paid';
      order.paymentId = cf_payment_id;
      order.orderStatus = 'confirmed';
      
      await order.save();
      
      console.log(`✅ Payment successful for order: ${order.orderId}`);
      
      return res.status(200).json({
        success: true,
        message: "Payment confirmed"
      });
    }

    // Handle payment failure - DO NOT save to database
    if (payment_status === 'FAILED') {
      console.log(`❌ Payment failed for order: ${order.orderId}, NOT updating database`);
      
      // Delete the order from database since payment failed
      await Order.deleteOne({ cashfreeOrderId: order_id });
      
      return res.status(200).json({
        success: true,
        message: "Payment failed, order deleted from database"
      });
    }

    // Handle other statuses
    console.log(`ℹ️ Payment status: ${payment_status} for order: ${order.orderId}`);
    res.status(200).json({
      success: true,
      message: "Webhook received"
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message
    });
  }
}

// Verify Payment Status (Manual check) - UPDATED TO NOT SAVE FAILED PAYMENTS
async function verifyPayment(req, res) {
  try {
    const { orderId } = req.params;
    
    console.log('Verifying payment for order:', orderId);
    
    // Find order by your internal orderId
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // If it's COD, no need to verify with Cashfree
    if (order.paymentMethod === 'cod') {
      return res.status(200).json({
        success: true,
        paymentStatus: 'SUCCESS',
        order: order
      });
    }

    // Check if we have a cashfreeOrderId
    if (!order.cashfreeOrderId) {
      return res.status(400).json({
        success: false,
        message: "No Cashfree order ID found"
      });
    }

    // Check payment status with Cashfree
    const response = await axios.get(
      `${CASHFREE_CONFIG.baseUrl}/orders/${order.cashfreeOrderId}/payments`,
      { headers: getCashfreeHeaders() }
    );

    console.log('Cashfree verification response:', response.data);

    const payments = response.data;
    let paymentStatus = 'PENDING';
    
    if (payments && payments.length > 0) {
      const latestPayment = payments[0];
      paymentStatus = latestPayment.payment_status;
      
      if (latestPayment.payment_status === 'SUCCESS') {
        // Only update database for successful payments
        order.paymentStatus = 'paid';
        order.paymentId = latestPayment.cf_payment_id;
        order.orderStatus = 'confirmed';
        await order.save();
        
        console.log(`✅ Payment successful for order: ${order.orderId}, saved to database`);
      } else if (latestPayment.payment_status === 'FAILED') {
        // DO NOT save failed payments to database
        // Delete the order from database since payment failed
        await Order.deleteOne({ orderId: order.orderId });
        console.log(`❌ Payment failed for order: ${order.orderId}, order deleted from database`);
      }
    }

    res.status(200).json({
      success: true,
      paymentStatus: paymentStatus,
      order: paymentStatus === 'SUCCESS' ? order : null
    });

  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.response?.data || error.message
    });
  }
}

// Get user orders
async function getUserOrders(req, res) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
}

// Get single order
async function getOrder(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
}

// Cleanup failed orders (optional - can be run as a cron job)
async function cleanupFailedOrders() {
  try {
    // Delete orders that have been in pending state for more than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Order.deleteMany({
      paymentStatus: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    console.log(`Cleaned up ${result.deletedCount} failed orders`);
  } catch (error) {
    console.error('Error cleaning up failed orders:', error);
  }
}

// Run cleanup daily (you can set this up with a cron job)
setInterval(cleanupFailedOrders, 24 * 60 * 60 * 1000);

module.exports = {
  createOrder,
  handleCashfreeWebhook,
  verifyPayment,
  getUserOrders,
  getOrder,
  cleanupFailedOrders
};