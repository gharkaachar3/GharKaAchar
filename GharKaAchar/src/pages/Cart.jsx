import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { addToCart, updateQty, removeFromCart } from '../redux/CartSlice'; // adjust path
import { CartIcon } from './Homes'; // reuse your icon, or remove if not needed

const CartPage = () => {
const dispatch = useDispatch();
const cart = useSelector((s) => s.cart.cart);

// Map state items to view model (supports optional weight/image)
const cartItems = cart.map((i) => ({
id: i.id,
name: i.name,
price: i.price,
image: i.image,
weight: i.weight,
quantity: i.qty || 1,
}));

const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shipping = cartItems.length > 0 ? 50 : 0;
const total = subtotal + shipping;

const inc = (id, currentQty) => {
dispatch(updateQty({ id, qty: currentQty + 1 }));
};

const dec = (id, currentQty) => {
if (currentQty > 1) {
dispatch(updateQty({ id, qty: currentQty - 1 }));
} else {
// If qty would go to 0, remove item
dispatch(removeFromCart(id));
}
};

const removeItem = (id) => {
dispatch(removeFromCart(id));
};

return (
<div className="min-h-screen bg-amber-50">
<div className="container mx-auto px-4 py-6 md:py-10">
<h1 className="text-2xl md:text-3xl font-bold text-amber-900 font-serif mb-6 text-center">
Your Cart
</h1>

text
    {cartItems.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-lg text-amber-800 mb-4">Your cart is empty</p>
        <Link
          to="/"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>
    ) : (
      <div className="md:flex md:space-x-6">
        {/* Cart Items */}
        <div className="md:w-2/3">
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-amber-100 pb-2 mb-4">
              <div className="col-span-5 font-medium text-amber-900">Product</div>
              <div className="col-span-2 font-medium text-amber-900">Price</div>
              <div className="col-span-3 font-medium text-amber-900">Quantity</div>
              <div className="col-span-2 font-medium text-amber-900">Total</div>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="border-b border-amber-100 pb-4 mb-4 last:border-0">
                <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                  {/* Product Image & Name */}
                  <div className="col-span-6 md:col-span-5 flex items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-amber-100 mr-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-900">{item.name}</h3>
                      {item.weight && (
                        <p className="text-xs text-amber-600">{item.weight}</p>
                      )}
                      <button
                        className="mt-1 text-xs text-red-600 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-3 md:col-span-2 text-amber-700 font-medium">
                    ₹{item.price}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3 md:col-span-3">
                    <div className="flex items-center border border-amber-300 rounded-lg w-fit">
                      <button
                        className="px-2 py-1 md:px-3 md:py-2 bg-amber-100 text-amber-800 hover:bg-amber-200"
                        onClick={() => dec(item.id, item.quantity)}
                      >
                        -
                      </button>
                      <span className="px-2 py-1 md:px-4 md:py-2 text-black">{item.quantity}</span>
                      <button
                        className="px-2 py-1 md:px-3 md:py-2 bg-amber-100 text-amber-800 hover:bg-amber-200"
                        onClick={() => inc(item.id, item.quantity)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-12 md:col-span-2 md:text-right font-medium text-amber-700">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Link to="/" className="text-amber-700 hover:text-amber-900 font-medium">
              ← Continue Shopping
            </Link>
            {/* Optional: nothing to update since changes are live */}
            <button
              className="text-amber-400 cursor-default"
              disabled
              title="Cart updates automatically"
            >
              Updates auto-saved
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:w-1/3 mt-6 md:mt-0">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-amber-900 font-serif mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium text-black">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping</span>
                <span className="font-medium text-black">₹{shipping}</span>
              </div>
              <div className="flex justify-between border-t border-amber-100 pt-3">
                <span className="text-lg font-bold text-amber-900">Total</span>
                <span className="text-lg font-bold text-amber-700">₹{total}</span>
              </div>
            </div>

            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
              <CartIcon className="w-5 h-5 mr-2" />
              Proceed to Checkout
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">
              or{' '}
              <Link to="/" className="text-amber-700 hover:text-amber-900">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
};

export default CartPage;