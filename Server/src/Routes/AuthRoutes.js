const express = require("express");
const Auth = express.Router();
const { register, login, logout , deleteUser , resetPassword , AddAdmin , RemoveAdmin} = require("../Controller/AuthController");
const userMiddleware = require("../Middleware/userMiddleware");
const Cart = require("../Model/Cart");
const adminMiddleware = require("../Middleware/adminMiddleware");

Auth.post('/register',register);
Auth.post('/login',login);
Auth.get("/logout",userMiddleware,logout);
Auth.post('/deleteuser',userMiddleware,deleteUser);
Auth.post('/resetpassword',userMiddleware,resetPassword);

Auth.get('/check',userMiddleware,async (req,res)=>{
    const cart = await Cart.findOne({userid:req.user._id});
    console.log(req.user)
    const reply = {
        name: req.user.name,
        email: req.user.email,
        _id:req.user._id,
        role:req.user.role,
        number:req.user.number,
        cart:cart.cart.length === 0 || !cart ?[] : cart.cart
    }
    res.status(200).json({
        user:reply,
        message:"Valid User"
     })

});
Auth.post("/add/admin",adminMiddleware,AddAdmin);  
Auth.delete("/remove/admin/:id",adminMiddleware,RemoveAdmin)

module.exports = Auth