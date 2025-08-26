const Order = require('../models/Order');
const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');

// Cashfree config
const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  baseUrl: process.env.CASHFREE_BASE_URL,
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
        // Create Cashfree order
        const cashfreeOrderData = {
          order_id: 'ORD' + Date.now() + Math.floor(Math.random() * 1000),
          order_amount: totalAmount,
          order_currency: 'INR',
          customer_details: {
            customer_id: userId,
            customer_name: userName,
            customer_email: user.email || `user${userId}@example.com`,
            customer_phone: phone
          },
          order_meta: {
            return_url: `${process.env.FRONTEND_URL}/payment-callback`,
            notify_url: `${process.env.BACKEND_URL}/api/orders/cashfree/webhook`
          }
        };

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
        console.error('Cashfree order creation failed:', cashfreeError);
        return res.status(500).json({
          success: false,
          message: "Payment gateway error. Please try again."
        });
      }
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
}

// Cashfree Webhook Handler
async function handleCashfreeWebhook(req, res) {
  try {
    const { order_id, payment_status, cf_payment_id, order_amount } = req.body;

    console.log('Cashfree webhook:', req.body);

    // Find order by Cashfree order ID
    const order = await Order.findOne({ cashfreeOrderId: order_id });
    if (!order) {
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
      
      await order.updateStatus('confirmed', 'Payment successful via Cashfree');
      
      console.log(`✅ Payment successful for order: ${order.orderId}`);
      
      return res.status(200).json({
        success: true,
        message: "Payment confirmed"
      });
    }

    // Handle payment failure
    if (payment_status === 'FAILED') {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      
      await order.updateStatus('cancelled', 'Payment failed');
      
      console.log(`❌ Payment failed for order: ${order.orderId}`);
      
      return res.status(200).json({
        success: true,
        message: "Payment failed, order cancelled"
      });
    }

    // Handle other statuses
    res.status(200).json({
      success: true,
      message: "Webhook received"
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed"
    });
  }
}

// Verify Payment Status (Manual check)
async function verifyPayment(req, res) {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    if (!order || !order.cashfreeOrderId) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check payment status with Cashfree
    const response = await axios.get(
      `${CASHFREE_CONFIG.baseUrl}/orders/${order.cashfreeOrderId}/payments`,
      { headers: getCashfreeHeaders() }
    );

    const payments = response.data;
    if (payments && payments.length > 0) {
      const latestPayment = payments[0];
      
      if (latestPayment.payment_status === 'SUCCESS') {
        order.paymentStatus = 'paid';
        order.paymentId = latestPayment.cf_payment_id;
        order.orderStatus = 'confirmed';
        await order.save();
      } else if (latestPayment.payment_status === 'FAILED') {
        order.paymentStatus = 'failed';
        order.orderStatus = 'cancelled';
        await order.save();
      }
    }

    res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
}

// Get user orders
async function getUserOrders(req, res) {
  try {
    const userId = req.user.id;
    const orders = await Order.findByUserId(userId);
    
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

module.exports = {
  createOrder,
  handleCashfreeWebhook,
  verifyPayment,
  getUserOrders,
  getOrder
};
