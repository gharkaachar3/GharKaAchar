const Cart = require("../Model/Cart");

async function AddToCart(req, res) {
  try {
    const { _id } = req.user; // middleware se aya user id
    const { cart } = req.body; // frontend se bheja gaya cart array

    let findCart = await Cart.findOne({ userid: _id });

    if (!findCart) {
      // New cart create
      const createCart = await Cart.create({
        userid: _id,
        cart: cart || []
      });
      return res.status(201).json({
        success: true,
        message: "Cart created & saved!",
        cart: createCart
      });
    }

    // Update existing cart
    findCart.cart = cart || [];
    await findCart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated & saved!",
      cart: findCart
    });

  } catch (e) {
    console.error("AddToCart error:", e.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message
    });
  }
}

module.exports = AddToCart;
