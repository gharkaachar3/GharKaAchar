const express = require('express');
const CartRouter = express.Router();
const AddToCart = require("../Controller/addToCart");
const userMiddleware = require("../Middleware/userMiddleware");

// API: POST /cart/add
CartRouter.post('/add', userMiddleware, AddToCart);

module.exports = CartRouter;
