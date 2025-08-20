const mongoose = require("mongoose");
const {Schema} = mongoose;

const ProductSchema = new Schema({
    userid:{
        type:Schema.Types.ObjectId,
        required:true
    },
    product_name:{
        type:String,
        require:true
    },
    product_category:{
        type:String,
        required:true
    },
    product_image:{
        type:String,
        required:true,
    },
    image_publicID:{
        type:String,
        required:true
    },
    product_description:{
        type:String,
        required:true
    },
    product_quantity:{
        type:String,
        required:true
    },
    product_price:{
        type:Number,
        required:true
    }
},{
    timestamps:true,
    strict:true
});

const product = mongoose.model("Products",ProductSchema);
module.exports = product;