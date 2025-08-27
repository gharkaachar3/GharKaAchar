import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateQty, removeFromCart } from '../redux/CartSlice';
import { CartIcon } from './Homes';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import Checkout from '../components/PlaceOrderComponent';

// Simple Icons
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CartPage = () => {
  const dispatch = useDispatch();
  const { cart = [] } = useSelector((s) => s.cart || {});
  const [removingItems, setRemovingItems] = useState(new Set());
  // ✅ Added state for checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const cartItems = Array.isArray(cart) ? cart.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    image: i.image,
    weight: i.weight,
    quantity: i.qty || 1,
  })) : [];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  const showToast = (message, type = 'success') => {
    toast[type](message, {
      duration: 2000,
      position: "top-center",
    });
  };

  const inc = (id, currentQty) => {
    dispatch(updateQty({ id, qty: currentQty + 1 }));
    showToast('Quantity updated!', 'success');
  };

  const dec = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQty({ id, qty: currentQty - 1 }));
      showToast('Quantity updated!', 'success');
    } else {
      removeItem(id);
    }
  };

  const removeItem = (id) => {
    setRemovingItems(prev => new Set(prev).add(id));
    setTimeout(() => {
      dispatch(removeFromCart(id));
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      showToast('Item removed from cart', 'success');
    }, 300);
  };

  // ✅ Handle Checkout Button Click
  const onCheckoutClick = () => {
    if (cartItems.length > 0) {
      setShowCheckoutModal(true);
    } else {
      showToast('Your cart is empty!', 'error');
    }
  };

  // ✅ Close checkout modal
  const onCloseCheckout = () => {
    setShowCheckoutModal(false);
  };

  // ✅ Handle successful order
  const onOrderSuccess = (order) => {
    console.log('Order placed successfully:', order);
    setShowCheckoutModal(false);
    showToast('Order placed successfully! 🎉', 'success');
    // Optionally clear cart after successful order
    // cartItems.forEach(item => dispatch(removeFromCart(item.id)));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Toaster richColors position="top-center" />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Your Shopping <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Cart</span>
          </h1>
          <p className="text-gray-600 text-xl">
            {cartItems.length === 0 ? 'Your cart is waiting for delicious items' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} ready for checkout`}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-6 rounded-full" />
        </motion.div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-12">
              <ShoppingBagIcon className="text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Your cart is empty</h2>
            <p className="text-gray-600 mb-12 max-w-lg mx-auto text-lg leading-relaxed">
              Discover our authentic Indian pickles, chutneys, and traditional delicacies. Start your culinary journey today!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              <CartIcon className="w-5 h-5" />
              Explore Products
            </Link>
          </motion.div>
        ) : (
          /* Cart with Items */
          <motion.div 
            className="max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="lg:flex lg:gap-12">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <motion.div 
                  className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden"
                  variants={itemVariants}
                >
                  {/* Desktop Header */}
                  <div className="hidden lg:block bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                    <div className="grid grid-cols-12 gap-6 p-6">
                      <div className="col-span-6 text-lg font-bold text-gray-800">Product Details</div>
                      <div className="col-span-2 text-lg font-bold text-gray-800 text-center">Price</div>
                      <div className="col-span-2 text-lg font-bold text-gray-800 text-center">Quantity</div>
                      <div className="col-span-2 text-lg font-bold text-gray-800 text-right">Total</div>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <AnimatePresence>
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className={`border-b border-amber-100 last:border-b-0 transition-all duration-300 ${
                          removingItems.has(item.id) ? 'opacity-50 scale-95' : ''
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="grid grid-cols-12 gap-6 p-6 items-center">
                          {/* Product Info */}
                          <div className="col-span-12 lg:col-span-6">
                            <div className="flex gap-4">
                              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl overflow-hidden flex-shrink-0 border border-amber-200">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                  {item.name}
                                </h3>
                                {item.weight && (
                                  <p className="text-amber-600 text-sm font-medium mb-3 bg-amber-50 px-3 py-1 rounded-full inline-block">
                                    {item.weight}
                                  </p>
                                )}
                                <button
                                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <TrashIcon />
                                  Remove Item
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price - Desktop */}
                          <div className="hidden lg:block lg:col-span-2 text-center">
                            <div className="text-2xl font-bold text-amber-700">₹{item.price}</div>
                            <div className="text-sm text-gray-500">per piece</div>
                          </div>

                          {/* Quantity - Desktop */}
                          <div className="hidden lg:block lg:col-span-2">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center bg-white border border-amber-300 rounded-lg shadow-sm overflow-hidden">
                                <button
                                  onClick={() => dec(item.id, item.quantity)}
                                  className="w-10 h-10 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors border-r border-amber-200"
                                  type="button"
                                >
                                  <MinusIcon />
                                </button>
                                <div className="w-16 h-10 flex items-center justify-center font-bold text-lg text-gray-900 bg-white">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={() => inc(item.id, item.quantity)}
                                  className="w-10 h-10 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors border-l border-amber-200"
                                  type="button"
                                >
                                  <PlusIcon />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Total - Desktop */}
                          <div className="hidden lg:block lg:col-span-2 text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">total</div>
                          </div>

                          {/* Mobile Layout */}
                          <div className="col-span-12 lg:hidden mt-6 pt-6 border-t border-amber-100">
                            <div className="grid grid-cols-3 gap-4">
                              {/* Price - Mobile */}
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Unit Price</div>
                                <div className="text-xl font-bold text-amber-700">₹{item.price}</div>
                              </div>

                              {/* Quantity - Mobile */}
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Quantity</div>
                                <div className="flex items-center justify-center">
                                  <div className="flex items-center bg-white border border-amber-300 rounded-lg shadow-sm overflow-hidden">
                                    <button
                                      onClick={() => dec(item.id, item.quantity)}
                                      className="w-9 h-9 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors border-r border-amber-200"
                                      type="button"
                                    >
                                      <MinusIcon />
                                    </button>
                                    <div className="w-12 h-9 flex items-center justify-center font-bold text-gray-900 bg-white">
                                      {item.quantity}
                                    </div>
                                    <button
                                      onClick={() => inc(item.id, item.quantity)}
                                      className="w-9 h-9 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors border-l border-amber-200"
                                      type="button"
                                    >
                                      <PlusIcon />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Total - Mobile */}
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Total Price</div>
                                <div className="text-xl font-bold text-gray-900">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Continue Shopping */}
                <motion.div 
                  className="mt-8 flex justify-between items-center"
                  variants={itemVariants}
                >
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Continue Shopping
                  </Link>
                  <div className="text-green-600 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cart automatically saved
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <motion.div 
                className="lg:w-1/3 mt-12 lg:mt-0"
                variants={itemVariants}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-8 sticky top-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Order Summary
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full" />
                  </div>

                  <div className="space-y-6">
                    {/* Price Breakdown */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl space-y-4 border border-amber-200">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-700 font-medium">Subtotal ({cartItems.length} items)</span>
                        <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-700 font-medium">Shipping & Handling</span>
                        <span className="font-bold text-gray-900">₹{shipping}</span>
                      </div>

                      <div className="border-t border-amber-200 pt-4">
                        <div className="flex justify-between text-2xl font-bold">
                          <span className="text-gray-800">Total Amount</span>
                          <span className="text-amber-700">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Updated Checkout Button */}
                    <button 
                      onClick={onCheckoutClick}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-bold text-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Proceed to Checkout
                    </button>

                    {/* Security & Trust */}
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-semibold">Secure Checkout</span>
                      </div>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>✓ SSL encrypted payment</p>
                        <p>✓ Money back guarantee</p>
                        <p>✓ Free return within 7 days</p>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <Link 
                          to="/" 
                          className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                        >
                          or Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ✅ Checkout Modal */}
        <AnimatePresence>
          {showCheckoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm"
              onClick={onCloseCheckout}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onCloseCheckout}
                  className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  aria-label="Close Checkout"
                >
                  <CloseIcon className="text-gray-600 hover:text-gray-900" />
                </button>

                {/* Checkout Component */}
                <div className="overflow-y-auto max-h-[95vh]">
                  <Checkout 
                    cartItems={cartItems} 
                    onOrderSuccess={onOrderSuccess}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CartPage;
