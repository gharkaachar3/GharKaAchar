// In the verifyPayment function, modify the failed payment handling:
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
        // Just return the status without updating the database
        console.log(`❌ Payment failed for order: ${order.orderId}, NOT saving to database`);
        
        // If order was previously created but payment failed, you might want to delete it
        // await Order.deleteOne({ orderId: order.orderId });
      }
    }

    res.status(200).json({
      success: true,
      paymentStatus: paymentStatus,
      order: order
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

// Also update the webhook handler to not save failed payments:
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
      
      // Optionally delete the order from database if payment failed
      // await Order.deleteOne({ cashfreeOrderId: order_id });
      
      return res.status(200).json({
        success: true,
        message: "Payment failed, order not saved"
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
}import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axiosClient from '../utils/axiosClient';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract URL parameters
  const orderId = searchParams.get('order_id');
  const cfOrderId = searchParams.get('cf_order_id');
  const orderToken = searchParams.get('order_token');
  const paymentId = searchParams.get('payment_id');
  const paymentStatusParam = searchParams.get('payment_status');

  useEffect(() => {
    // Check if we have a direct payment status from Cashfree redirect
    if (paymentStatusParam === 'SUCCESS' && orderId) {
      verifyPayment();
    } else if (paymentStatusParam === 'FAILED') {
      setPaymentStatus('failed');
      setError('Payment was declined or failed. Please try again.');
      setLoading(false);
      toast.error('Payment failed');
      
      // Clear any pending order data from localStorage
      localStorage.removeItem('pendingOrder');
    } else if (orderId) {
      verifyPayment();
    } else {
      setPaymentStatus('failed');
      setError('Invalid payment parameters');
      setLoading(false);
      toast.error('Invalid payment parameters');
      
      // Clear any pending order data from localStorage
      localStorage.removeItem('pendingOrder');
    }
  }, [orderId, paymentStatusParam]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      console.log('Verifying payment for order:', orderId);
      
      const response = await axiosClient.get(`/cashfree/verify/${orderId}`);
      console.log('Verification response:', response.data);

      if (response.data.success) {
        if (response.data.paymentStatus === 'SUCCESS') {
          setPaymentStatus('success');
          setOrderDetails(response.data.order);
          toast.success('🎉 Payment successful!');
          
          // Clear any pending order data from localStorage
          localStorage.removeItem('pendingOrder');
        } else if (response.data.paymentStatus === 'PENDING') {
          // Keep checking for pending status
          setTimeout(() => {
            verifyPayment();
          }, 2000);
          return;
        } else {
          setPaymentStatus('failed');
          setError(response.data.message || 'Payment verification failed');
          toast.error('Payment verification failed');
          
          // Clear any pending order data from localStorage
          localStorage.removeItem('pendingOrder');
        }
      } else {
        setPaymentStatus('failed');
        setError(response.data.message || 'Payment verification failed');
        toast.error('Payment verification failed');
        
        // Clear any pending order data from localStorage
        localStorage.removeItem('pendingOrder');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      setError(error.response?.data?.message || 'Payment verification failed');
      toast.error('Payment verification failed');
      
      // Clear any pending order data from localStorage
      localStorage.removeItem('pendingOrder');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    // Clear any existing order data and go back to cart
    localStorage.removeItem('pendingOrder');
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    // Clear any pending order data
    localStorage.removeItem('pendingOrder');
    navigate('/');
  };

  const handleViewOrder = () => {
    if (orderDetails?.orderId) {
      navigate(`/orders/${orderDetails.orderId}`);
    } else {
      navigate('/profile/orders');
    }
  };

  const handleDownloadInvoice = () => {
    // Implement invoice download logic
    toast.success('Invoice download started');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.2
      }
    }
  };

  // Render different states
  const renderContent = () => {
    if (loading || paymentStatus === 'processing') {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={iconVariants} className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-12 h-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Processing Payment...</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Please wait while we verify your payment. This may take a few moments.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure SSL encrypted transaction</span>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div variants={iconVariants} className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Success Content */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-xl text-gray-600">Thank you for your order</p>
            </div>

            {orderDetails && (
              <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold text-gray-900">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">₹{orderDetails.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-900">Online Payment</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleViewOrder}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Order Details
              </button>
              
              <button
                onClick={handleDownloadInvoice}
                className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </button>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    // Failed state
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        {/* Error Icon */}
        <motion.div variants={iconVariants} className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </motion.div>

        {/* Error Content */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-xl text-gray-600">Something went wrong with your payment</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-red-700 text-sm">
              {error || 'Your payment could not be processed. Please try again or contact support if the issue persists.'}
            </p>
            {orderId && (
              <p className="text-red-600 text-xs mt-2">
                Reference ID: {orderId}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleRetryPayment}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Payment
            </button>
            
            <button
              onClick={() => navigate('/support')}
              className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contact Support
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header Pattern */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
          
          {/* Main Content */}
          <div className="p-8 sm:p-12">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <button
                onClick={handleContinueShopping}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ← Continue Shopping
              </button>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Payment
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  SSL Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {paymentStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <p className="text-gray-600">Order Confirmation Email Sent</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-orange-600 font-semibold">2</span>
                  </div>
                  <p className="text-gray-600">Preparing Your Order</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-green-600 font-semibold">3</span>
                  </div>
                  <p className="text-gray-600">Order Delivered</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;