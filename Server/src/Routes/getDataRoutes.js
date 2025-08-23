const userMiddleware = require("../Middleware/userMiddleware");
const { getAllProducts , getAllcategories , getAllbanners , getAllUsers } = require("../Controller/getData");
const express = require("express");
const adminMiddleware = require("../Middleware/adminMiddleware");
const getdata = express.Router();

getdata.get("/allproducts",getAllProducts);
getdata.get("/allcategories",getAllcategories);
getdata.get("/allbanner",getAllbanners);
getdata.get("/alladmins",adminMiddleware,getAllUsers);


module.exports = getdata