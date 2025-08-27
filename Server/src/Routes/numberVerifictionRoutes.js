const express = require("express");
const numberVerifyrouter= express.Router();
const userMiddleware = require("../Middleware/userMiddleware");
const { sendOtp, verifyOtp, CheckphoneNo } = require("../Controller/Numberverification");

numberVerifyrouter.post('/send', userMiddleware, sendOtp);     
numberVerifyrouter.post('/verify', userMiddleware , verifyOtp); 
numberVerifyrouter.post('/check-phone',userMiddleware, CheckphoneNo)

module.exports = numberVerifyrouter