const categories = require("../Model/AddCategories")
const Product = require("../Model/AddProduct");
const banner = require("../Model/Addbanners");
const user = require("../Model/User");
const order = require("../Model/order");

const getAllProducts = async (req,res)=>{
    try{
        const ResData = await Product.find({});
        res.status(200).json({
            message:"heres your all data!",
            data:ResData
        })
    }
    catch(e){
        res.status(400).json({
            message:"internal server error: "+e.message,
            data:null
        })
    }
}

const getAllcategories = async (req,res)=>{
    try{
        const ResData = await categories.find({});
        res.status(200).json({
            message:"heres your all data!",
            data:ResData
        })
    }
    catch(e){
        res.status(400).json({
            message:"internal server error: "+e.message,
            data:null
        })
    }
}

const getAllbanners = async (req,res)=>{
    try{
        const ResData = await banner.find({});
        res.status(200).json({
            message:"heres your all data!",
            data:ResData
        })
    }
    catch(e){
        res.status(400).json({
            message:"internal server error: "+e.message,
            data:null
        })
    }
}

const getAllUsers = async (req, res) => {
  try {
    // console.log("hello")
    // Fetch users where role is 'admin'
    const ResData = await user.find({});


    res.status(200).json({
      message: "Here’s your admin users data!",
      data: ResData,
    });
  } catch (e) {
    res.status(400).json({
      message: "Internal server error: " + e.message,
      data: null,
    });
  }
};

const getAllOrder = async (req,res) => {
      try{
        const ResData = await order.find({});
        res.status(200).json({
            message:"heres your all data!",
            data:ResData
        })
    }
    catch(e){
        res.status(400).json({
            message:"internal server error: "+e.message,
            data:null
        })
    }
}

module.exports = { getAllProducts , getAllcategories , getAllbanners ,getAllUsers ,  getAllOrder }



