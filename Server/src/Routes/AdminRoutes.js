// routes/productRoutes.js
const express = require("express");
const AdminRoutes = express.Router();
const adminMiddleware = require("../Middleware/adminMiddleware");
const {
    getSignature,
    addProduct,
    deleteProduct,
    addcategory,
    deleteCategory,
    Addbanners,
    deleteBanner
} = require("../Controller/Additems"); 

AdminRoutes.post("/add", adminMiddleware, addProduct);
AdminRoutes.post("/signature", adminMiddleware, getSignature);
AdminRoutes.post('/add/category',adminMiddleware,addcategory);
AdminRoutes.post("/add/banner",adminMiddleware,Addbanners);

AdminRoutes.delete("/delete/:id", adminMiddleware, deleteProduct);
AdminRoutes.delete("/delete/category/:id",adminMiddleware,deleteCategory);
AdminRoutes.delete("/delete/banner/:id",adminMiddleware,deleteBanner);


module.exports = AdminRoutes;
