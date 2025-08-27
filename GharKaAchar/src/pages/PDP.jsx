import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Checkout from '../components/PlaceOrderComponent';

// Professional Shimmer Loading Component
const ProductPageShimmer = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 font-inter overflow-x-hidden">
    <div className="w-full max-w-7xl px-4 py-8 mx-auto">
      <div className="flex items-center space-x-2 mb-8 overflow-x-hidden">
        <div className="w-16 h-4 bg-amber-200 rounded animate-pulse flex-shrink-0"></div>
        <div className="w-1 h-4 bg-amber-200 rounded animate-pulse flex-shrink-0"></div>
        <div className="w-24 h-4 bg-amber-200 rounded animate-pulse flex-shrink-0"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="space-y-6">
          <div className="w-full h-96 bg-amber-200 rounded-xl animate-pulse"></div>
          <div className="flex gap-3 overflow-x-auto">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-16 h-16 bg-amber-200 rounded-lg animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="w-3/4 h-8 bg-amber-200 rounded animate-pulse"></div>
          <div className="w-full h-32 bg-amber-200 rounded animate-pulse"></div>
          <div className="w-1/2 h-12 bg-amber-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// ✅ Enhanced Toast Component
const Toast = ({ message, type = 'success', onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl ${
        type === 'success' 
          ? 'bg-gradient-to-r from-green-500 to-green-600' 
          : 'bg-gradient-to-r from-red-500 to-red-600'
      } text-white font-medium min-w-[280px] max-w-[90vw]`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-green-400' : 'bg-red-400'
        }`}>
          {type === 'success' ? '✓' : '🔒'}
        </div>
        <span className="flex-1">{message}</span>
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

// Main ProductPage Component
const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { data, loading, error } = useSelector(state => state.getdata);
  const { isAuthenticated } = useSelector(state => state.auth);
  const cartItems = useSelector(state => state.cart.items || []);
  
  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // ✅ FIXED: Scroll to top when params change
  useEffect(() => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  }, [id]); // Dependency on id parameter

  // Reset states when product changes
  useEffect(() => {
    setQty(1);
    setSelectedImageIndex(0);
    setShowCheckout(false);
    setToast(null);
  }, [id]);

  const backendProducts = data?.data || [];
  const product = backendProducts.find(p => 
    String(p._id) === String(id) || String(p.id) === String(id)
  );
  
  const recommendedProducts = backendProducts
    .filter(p => {
      const productId = String(p._id || p.id);
      const currentId = String(id);
      return productId !== currentId;
    })
    .slice(0, 8);

  // Loading/Error/NotFound states
  if (loading) return <ProductPageShimmer />;
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 overflow-x-hidden">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Product Not Found</h2>
          <Link to="/" className="block w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const addToCartHandler = () => {
    dispatch(addToCart({
      id: product._id || product.id,
      name: product.product_name || product.name,
      price: product.product_price || product.price,
      image: product.product_image || product.image,
      qty: qty,
    }));
    
    setToast({
      message: `🛒 ${product.product_name} added to cart!`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 3000);
  };

  const buyNowHandler = () => {
    if (!isAuthenticated) {
      setToast({
        message: '🔒 Please login to purchase',
        type: 'error'
      });
      
      setTimeout(() => {
        setToast(null);
        navigate('/login', { 
          state: { from: { pathname: window.location.pathname } } 
        });
      }, 2000);
      
      return;
    }

    dispatch(addToCart({
      id: product._id || product.id,
      name: product.product_name || product.name,
      price: product.product_price || product.price,
      image: product.product_image || product.image,
      qty: qty,
    }));

    setShowCheckout(true);
  };

  const handleOrderSuccess = (order) => {
    setShowCheckout(false);
    setToast({
      message: '🎉 Order placed successfully!',
      type: 'success'
    });
    
    setTimeout(() => {
      setToast(null);
      navigate('/');
    }, 3000);
  };

  const getCheckoutItems = () => {
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
    
    const currentProduct = {
      id: product._id || product.id,
      name: product.product_name || product.name,
      price: product.product_price || product.price,
      image: product.product_image || product.image,
      quantity: qty,
      qty: qty
    };

    const existingProductIndex = safeCartItems.findIndex(item => 
      String(item.id) === String(currentProduct.id)
    );

    let checkoutItems = [];

    if (existingProductIndex >= 0) {
      checkoutItems = safeCartItems.map((item, index) => {
        if (index === existingProductIndex) {
          return {
            ...item,
            quantity: qty,
            qty: qty
          };
        }
        return {
          ...item,
          quantity: item.qty || item.quantity || 1,
          qty: item.qty || item.quantity || 1
        };
      });
    } else {
      checkoutItems = [
        ...safeCartItems.map(item => ({
          ...item,
          quantity: item.qty || item.quantity || 1,
          qty: item.qty || item.quantity || 1
        })),
        currentProduct
      ];
    }

    return checkoutItems;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 font-inter overflow-x-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ✅ FIXED: Added overflow-x-hidden and proper max-width */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-amber-700 mb-8 space-x-2 overflow-x-auto">
          <Link to="/" className="hover:text-amber-800 transition-colors font-medium whitespace-nowrap">Home</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/" className="hover:text-amber-800 transition-colors font-medium whitespace-nowrap">Products</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-amber-900 font-semibold truncate min-w-0">{product.product_name}</span>
        </nav>

        {/* ✅ FIXED: Better Layout for All Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 w-full">
          
          {/* ✅ Product Images Section - FIXED OVERFLOW */}
          <div className="space-y-6 w-full overflow-hidden">
            {/* Main Product Image */}
            <div className="aspect-square bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden relative group w-full">
              <img 
                src={product.product_image || 'https://via.placeholder.com/600x600?text=Product+Image'}
                alt={product.product_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
                }}
              />
              
              {/* Offer Badge */}
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg">
                  {Math.round((1 - product.product_price / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images (if available) */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 justify-center overflow-x-auto pb-2">
                {product.images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 flex-shrink-0 rounded-xl border-2 transition-all overflow-hidden ${
                      selectedImageIndex === index 
                        ? 'border-amber-500 ring-2 ring-amber-200 scale-110' 
                        : 'border-amber-200 hover:border-amber-300'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.product_name} ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Product Details Section - IMPROVED LAYOUT */}
          <div className="space-y-6 w-full min-w-0">
            <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 lg:p-8 w-full overflow-hidden">
              
              {/* Category */}
              <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mb-4">
                {product.product_category || 'Pickles & Preserves'}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-4 break-words">
                {product.product_name}
              </h1>

              {/* Product Description */}
              {product.product_description && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed break-words">{product.product_description}</p>
                </div>
              )}

              {/* ✅ Price Section - RESPONSIVE */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 lg:p-6 mb-6 border border-amber-200">
                <div className="flex flex-wrap items-baseline gap-2 mb-4">
                  <span className="text-3xl lg:text-4xl font-black text-amber-700">₹{product.product_price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        {Math.round((1 - product.product_price / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                
                {/* Stock and Size Info */}
                <div className="space-y-2 text-sm">
                  {product.product_quantity && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-700">Size:</span>
                      <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-mono font-bold text-xs">
                        {product.product_quantity}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>In Stock - Ready to Ship</span>
                  </div>
                </div>
              </div>

              {/* ✅ Quantity Selector - RESPONSIVE */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-base font-bold text-gray-900 flex-shrink-0">Quantity:</span>
                <div className="flex items-center border-2 border-amber-300 rounded-xl overflow-hidden shadow-lg">
                  <button 
                    className="px-4 py-2 hover:bg-amber-50 text-gray-700 font-bold text-lg transition-colors"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-black text-xl text-gray-900 bg-white min-w-[60px] text-center">
                    {qty}
                  </span>
                  <button 
                    className="px-4 py-2 hover:bg-amber-50 text-gray-700 font-bold text-lg transition-colors"
                    onClick={() => setQty(qty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ✅ Action Buttons - RESPONSIVE */}
              <div className="space-y-3">
                <motion.button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 px-6 rounded-2xl font-bold text-base tracking-wide transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2"
                  onClick={addToCartHandler}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>ADD TO CART</span>
                </motion.button>

                <motion.button 
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-2xl font-bold text-base tracking-wide transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2"
                  onClick={buyNowHandler}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>BUY NOW</span>
                </motion.button>
              </div>

              {/* Product Highlights */}
              <div className="border-t border-amber-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose This Product?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Authentic Recipe',
                    'Premium Quality', 
                    'No Preservatives',
                    'Hygienic Packing'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 w-full overflow-hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Specifications</h3>
              <div className="space-y-4">
                {[
                  { label: 'Brand', value: 'GharKaAchar' },
                  { label: 'Category', value: product.product_category || 'Pickles' },
                  ...(product.product_quantity ? [{ label: 'Weight/Size', value: product.product_quantity }] : []),
                  { label: 'Shelf Life', value: '12 months' }
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-amber-100 last:border-b-0">
                    <span className="text-gray-600 font-semibold">{spec.label}</span>
                    <span className="font-bold text-gray-900 break-words text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FIXED: More Products Section - 2 Cards Per Row */}
        {recommendedProducts.length > 0 && (
          <motion.div className="mt-16 w-full overflow-hidden">
            <motion.div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                More Products <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">You'll Love</span>
              </h2>
              <p className="text-gray-600 text-base lg:text-lg max-w-3xl mx-auto px-4">
                Discover more delicious products that perfectly complement your selection
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-6 rounded-full" />
            </motion.div>

            {/* ✅ UPDATED: 2 cards per row layout with proper mobile handling */}
            <motion.div className="grid grid-cols-2 gap-4 lg:gap-8 max-w-4xl mx-auto px-2 lg:px-0">
              {recommendedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id || relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="w-full"
                >
                  <Link to={`/product/${relatedProduct._id || relatedProduct.id}`} className="block">
                    <div className="group bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-200 transform hover:scale-105 w-full">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={relatedProduct.product_image || 'https://via.placeholder.com/400x400?text=Product'}
                          alt={relatedProduct.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x400?text=Product';
                          }}
                        />
                        
                        {/* Category Badge */}
                        {relatedProduct.product_category && (
                          <div className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                            {relatedProduct.product_category}
                          </div>
                        )}
                      </div>

                      <div className="p-3 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3">
                          <h3 className="text-sm lg:text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-amber-700 transition-colors mb-2 lg:mb-0 lg:flex-1 lg:pr-2 break-words">
                            {relatedProduct.product_name}
                          </h3>
                          {relatedProduct.product_quantity && (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 self-start">
                              {relatedProduct.product_quantity}
                            </span>
                          )}
                        </div>

                        {relatedProduct.product_description && (
                          <p className="text-gray-600 text-xs lg:text-sm mb-3 line-clamp-2 break-words">
                            {relatedProduct.product_description.substring(0, 80)}...
                          </p>
                        )}

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-lg lg:text-xl font-bold text-amber-700">₹{relatedProduct.product_price}</span>
                            {relatedProduct.product_price && (
                              <span className="text-gray-400 text-xs lg:text-sm line-through">₹{Math.floor(relatedProduct.product_price * 1.4)}</span>
                            )}
                          </div>
                          <motion.button
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold flex items-center justify-center gap-1 transition-all shadow-lg hover:shadow-xl w-full lg:w-auto"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              dispatch(addToCart({
                                id: relatedProduct._id || relatedProduct.id,
                                name: relatedProduct.product_name,
                                price: relatedProduct.product_price,
                                image: relatedProduct.product_image,
                                qty: 1,
                              }));
                              setToast({
                                message: `🛒 ${relatedProduct.product_name} added to cart!`,
                                type: 'success'
                              });
                              setTimeout(() => setToast(null), 3000);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg className="h-3 w-3 lg:h-4 lg:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Add to Cart</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* ✅ Fixed Checkout Modal with overflow protection */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCheckout(false)}
            />
            
            <div className="relative z-10 flex min-h-full items-center justify-center p-2 lg:p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="relative w-full max-w-7xl max-h-[95vh] bg-white rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Complete Your Order</h2>
                    <p className="text-gray-500 text-sm mt-1 hidden lg:block">Fill in your details to place the order</p>
                  </div>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                  <Checkout
                    cartItems={getCheckoutItems()}
                    onOrderSuccess={handleOrderSuccess}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
