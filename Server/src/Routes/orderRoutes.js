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
const order = require("../Model/order")

// Protected routes (require authentication)
Orderrouter.post('/create', protect, createOrder);
Orderrouter.get('/user-orders', protect, getUserOrders);
Orderrouter.get('/:orderId', protect, getOrder);
Orderrouter.get('/verify/:orderId', protect, verifyPayment);

// Webhook route (no auth required)
Orderrouter.post('/cashfree/webhook', handleCashfreeWebhook);
Orderrouter.get('/all',protect,async(req,res)=>{
  try{
    const data = await order.find({});
    res.status(200).send(data);
  }
  catch(e){
    res.status(400).send(e.message)
  }
})

module.exports = Orderrouter;
