const mongoose = require("mongoose");
const { Schema } = mongoose;

const AddbannerSchema = new Schema({
    banner_image:{
        type:String,
        required:true
    },
    banner_publicId:{
        type:String,
        required:true
    },
    banner_category:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

const banner = mongoose.model("banners",AddbannerSchema);
module.exports = banner