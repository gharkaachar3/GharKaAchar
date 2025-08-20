const cloudinary = require('cloudinary').v2;
const categories = require('../Model/AddCategories');
const Product = require("../Model/AddProduct")
const banner = require("../Model/Addbanners");



 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY , 
        api_secret: process.env.CLOUDINARY_API_SECRATE
    });

    const  getSignature = async (req,res)=>{
   try{
        console.log(req.body)
        const { _id,firstName } = req.user;
        const { Product_category , Product_name} = req.body;
        const timestamp = Math.round(new Date().getTime() /1000);
        const public_id = `GharKaAchar/Product/${Product_category}/${Product_name}_${timestamp}`;

        const uploadparams = {
            timestamp,
            public_id
        };

        const signature = cloudinary.utils.api_sign_request(
            uploadparams,
            process.env.CLOUDINARY_API_SECRATE
        );

        res.json({
            signature,
            timestamp,
            public_id:public_id,
            cloud_name: process.env.CLOUDINARY_NAME,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
            uploadUrl:`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`
        });
    }
    catch(err){
        console.log(err.message)
        res.status(400).send(err.message); 
    }
};

const addProduct = async (req, res) => {
  try {
    const { _id } = req.user; // middleware se aya userid

    const {
      product_name,
      product_category,
      product_image,
      image_publicID,
      product_description,
      product_quantity,
      product_price
    } = req.body;

    // Basic Validation
    if (
      !product_name ||
      !product_category ||
      !product_image ||
      !image_publicID ||
      !product_description ||
      !product_quantity ||
      !product_price
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newProduct = await Product.create({
      userid: _id,
      product_name,
      product_category,
      product_image,
      image_publicID,
      product_description,
      product_quantity,
      product_price
    });

    return res.status(201).json({
      success: true,
      message: "✅ Product added successfully",
      product: newProduct
    });

  } catch (err) {
    console.error("Add Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;       // product id in URL
    const requester = req.user;      // set by auth middleware
    console.log(id)  

    // 1) Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 2) Authorization: owner or admin
    const isOwner = String(product.userid) === String(requester._id);
    const role = (requester.role || requester.user?.role || "").toString().toLowerCase();
    const isAdmin = role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this product"
      });
    }

    // 3) Delete Cloudinary image if public ID exists
    if (product.image_publicID) {
      try {
        await cloudinary.uploader.destroy(product.image_publicID);
      } catch (e) {
        // Log but continue DB deletion to avoid orphan DB entry
        console.warn("Cloudinary delete failed:", e?.message || e);
      }
    }

    // 4) Delete product from DB
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "✅ Product deleted successfully",
      productId: id
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

const addcategory = async (req,res)=>{
  try{
    console.log(req.body);
    const { category_name , category_image , category_image_publicID } = req.body;
    if( !category_image || !category_name || !category_image_publicID  ) throw new Error("field is messing");
    // if(!req.user.role === 'admin') throw new Error("invalid user");
    const saveCategory = await categories.create(req.body);
    res.status(201).json({
      message:"category added succefully",
      categorys:saveCategory
    })
  }
  catch(e){
    console.log(e.message)
    res.status(400).json({
      message:"internal server error: "+e.message
    })
  }
}


const deleteCategory = async (req,res)=>{
 try {
    const { id } = req.params;      
    const requester = req.user;     

    const category = await categories.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const role = (requester.role || requester.user?.role || "").toString().toLowerCase();
    const isAdmin = role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this category"
      });
    }

    if (category.image_publicID) {
      try {
        await cloudinary.uploader.destroy(category.category_image_publicID);
      } catch (e) {
        console.warn("Cloudinary delete failed:", e?.message || e);
      }
    }

    await categories.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "✅ Product deleted successfully",
      productId: id
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
}

const Addbanners = async (req,res)=>{
  try{
    const saveBanner = await banner.create(req.body);
    res.status(201).json({
      message:"banner added!"
    })
  }
  catch(e){
    console.log(e.message);
    res.status(400).json({
      message:"internal server Error: "+e.message,
      data:null
    })
  }
}

const deleteBanner = async(req,res)=>{
   try {
    const { id } = req.params;      
    const requester = req.user;     

    const Banner = await banner.findById(id);
    if (!Banner) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const role = (requester.role || requester.user?.role || "").toString().toLowerCase();
    const isAdmin = role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this category"
      });
    }

    if (Banner.banner_publicId) {
      try {
        await cloudinary.uploader.destroy(Banner.banner_publicID);
      } catch (e) {
        console.warn("Cloudinary delete failed:", e?.message || e);
      }
    }

    await banner.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "✅ Product deleted successfully",
      productId: id
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
}

module.exports = {
    getSignature,
    addProduct,
    deleteProduct,
    addcategory,
    deleteCategory,
    Addbanners,
    deleteBanner
}