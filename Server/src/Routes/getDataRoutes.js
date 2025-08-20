const userMiddleware = require("../Middleware/userMiddleware");
const { getAllProducts , getAllcategories , getAllbanners } = require("../Controller/getData");
const express = require("express");
const getdata = express.Router();

getdata.get("/allproducts",getAllProducts);
getdata.get("/allcategories",getAllcategories);
getdata.get("/allbanner",getAllbanners);


module.exports = getdata