const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
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
        default: "user",
        enum: ['user', 'admin'],
        required: true
    }
}, {
    strict: true,
    timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;
