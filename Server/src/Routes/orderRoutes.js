const express = require('express');
const { 
  createOrder, 
  handleCashfreeWebhook, 
  verifyPayment,
  getUserOrders,
  getOrder 
} = require('../Controller/order');
const protect = require("../Middleware/userMiddleware")
const Orderrouter = express.Router();

// Protected routes (require authentication)
router.post('/create', protect, createOrder);
Orderrouter.get('/user-orders', protect, getUserOrders);
Orderrouter.get('/:orderId', protect, getOrder);
Orderrouter.get('/verify/:orderId', protect, verifyPayment);

// Webhook route (no auth required)
Orderrouter.post('/cashfree/webhook', handleCashfreeWebhook);

module.exports = Orderrouter;
