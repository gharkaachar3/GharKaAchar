const mongoose = require("mongoose");
const {Schema} = mongoose;

const CategoriesSchema = new Schema({
    category_name:{
        type:String,
        required:true
    },
    category_image:{
        type:String,
        required:true
    },
    category_image_publicID:{
        type:String,
        required:true
    }
},{
    timestamps:true,
    strict:true
});

const categories = mongoose.model("categories",CategoriesSchema);
module.exports = categories;