const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        immutable: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 6,
        maxlength: 100,
        required: true
    },
    number: {
        type: String,
        match: [/^\d{10}$/, "Number must be 10 digits"]
    },
    role: {
        type: String,
        default: "admin",
        enum: ['user', 'admin'],
        required: true
    }
}, {
    strict: true,
    timestamps: true
});

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;