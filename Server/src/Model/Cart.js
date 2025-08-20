const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartSchema = new Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      required: true,
      immutable: true,
      ref: "User" // User model ke saath relation
    },
    cart: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;

