import React, { useEffect, useMemo, useState } from 'react';
import { CartIcon } from './Homes';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Enhanced Icons
const HeartIcon = ({ filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const StarIcon = ({ filled = false, size = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={`inline-block ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
    width={size} 
    height={size} 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// Dynamic Rating Component
const ProductRating = ({ rating, reviewCount, size = 16 }) => {
  if (!rating || rating === 0 || rating === null || rating === undefined || isNaN(rating)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            filled={i < Math.floor(rating)} 
            size={size}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>
      {reviewCount && (
        <span className="text-sm text-gray-500">
          ({reviewCount} reviews)
        </span>
      )}
    </div>
  );
};

// Enhanced Toast Component
const Toast = ({ message, type = 'success', onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border ${
        type === 'success' 
          ? 'bg-white border-green-200 text-green-800' 
          : 'bg-white border-red-200 text-red-800'
      } min-w-[300px] max-w-[400px]`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {type === 'success' ? '✓' : '✕'}
        </div>
        <span className="flex-1 font-medium">{message}</span>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const ProductPage = () => {
  const { pathname, search } = useLocation();
  const dispatch = useDispatch();
  const { sampleProducts } = useSelector((s) => s.cart);
  const { id } = useParams();
  
  const [qty, setQty] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Convert id to number safely
  const pid = useMemo(() => {
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, [pathname, search]);

  // Enhanced fallback data
  const localProducts = [
    {
      id: 1,
      name: 'Sweet Mango Pickle',
      price: 249,
      originalPrice: 299,
      rating: 4.5,
      reviewCount: 127,
      description: 'Our traditional sweet mango pickle is made with carefully selected raw mangoes and a perfect blend of spices. This family recipe has been passed down for generations, preserving the authentic flavors of Indian pickling traditions.',
      image: 'https://www.jhajistore.com/cdn/shop/files/6_0db5b18c-a729-4a12-8f33-414be086ce24_500x.jpg?v=1703232511',
      images: [
        'https://www.jhajistore.com/cdn/shop/files/6_0db5b18c-a729-4a12-8f33-414be086ce24_500x.jpg?v=1703232511',
        'https://www.jhajistore.com/cdn/shop/files/6_0db5b18c-a729-4a12-8f33-414be086ce24_500x.jpg?v=1703232511',
        'https://www.jhajistore.com/cdn/shop/files/6_0db5b18c-a729-4a12-8f33-414be086ce24_500x.jpg?v=1703232511'
      ],
      category: 'Pickles',
      weight: '500g',
      ingredients: 'Raw mangoes, mustard oil, fenugreek, fennel, turmeric, red chili powder, salt, spices',
      shelfLife: '12 months',
      benefits: 'No preservatives - Vegan - Gluten-free - Handcrafted in small batches',
      inStock: true,
      fastDelivery: true,
      returnable: true
    },
  ];

  const allProducts = (sampleProducts && sampleProducts.length ? sampleProducts : localProducts);

  // Pick product by route id
  const product = useMemo(() => {
    if (pid == null) return null;
    return allProducts.find((p) => String(p.id) === String(pid)) || null;
  }, [allProducts, pid]);

  // Recommended products
  const recommendedProducts = useMemo(() => {
    return allProducts.filter((p) => product && p.id !== product.id).slice(0, 8);
  }, [allProducts, product]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addMainToCart = () => {
    if (!product) return;
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight,
      qty: qty,
    }));
    showToast(`🛒 ${product.name} added to cart!`);
  };

  const buyNow = () => {
    if (!product) return;
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight,
      qty: qty,
    }));
    showToast(`⚡ Proceeding to checkout...`);
    setTimeout(() => {
      window.location.href = '/cart';
    }, 1500);
  };

  const addRecommended = (rp) => {
    dispatch(addToCart({
      id: rp.id,
      name: rp.name,
      price: rp.price,
      image: rp.image,
      weight: rp.weight,
      qty: 1,
    }));
    showToast(`🛒 ${rp.name} added to cart!`);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        showToast('💔 Removed from favorites');
      } else {
        newFavorites.add(productId);
        showToast('❤️ Added to favorites!');
      }
      return newFavorites;
    });
  };

  if (pid == null || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">
            {pid == null ? 'Invalid Product ID' : 'Product Not Found'}
          </h2>
          <p className="text-amber-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link 
            to="/" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* ✅ Enhanced Product Details Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-amber-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:flex">
            {/* ✅ Enhanced Product Images */}
            <div className="lg:w-1/2 p-6 md:p-8">
              <div className="space-y-4">
                {/* Main Image */}
                <motion.div 
                  className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={product.images ? product.images[selectedImageIndex] : product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4">
                    <motion.button
                      className={`p-3 rounded-full backdrop-blur-sm transition-all shadow-lg border ${
                        favorites.has(product.id) 
                          ? 'bg-red-500 text-white border-red-300' 
                          : 'bg-white/90 text-gray-600 hover:text-red-500 border-white/50'
                      }`}
                      onClick={() => toggleFavorite(product.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <HeartIcon filled={favorites.has(product.id)} />
                    </motion.button>
                  </div>

                  {/* Badge */}
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <motion.button
                        key={index}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-amber-500 ring-2 ring-amber-200' 
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Enhanced Product Info */}
            <div className="lg:w-1/2 p-6 md:p-8">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm px-4 py-2 rounded-full font-semibold shadow-sm">
                  {product.category}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <ProductRating 
                rating={product.rating} 
                reviewCount={product.reviewCount}
                size={20}
              />

              {/* Price Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-amber-700">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                  )}
                </div>
                <p className="text-gray-600">
                  {product.weight && `${product.weight} jar • `}
                  <span className="text-green-600 font-medium">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </p>
              </div>

              {/* Product Features */}
              <div className="mb-8 grid grid-cols-3 gap-3">
                {product.fastDelivery && (
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                    <TruckIcon className="mx-auto mb-2 text-green-600" />
                    <p className="text-xs font-medium text-green-700">Fast Delivery</p>
                  </div>
                )}
                {product.returnable && (
                  <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <ShieldIcon className="mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-medium text-blue-700">Easy Returns</p>
                  </div>
                )}
                <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <StarIcon className="mx-auto mb-2 text-purple-600" size={20} filled />
                  <p className="text-xs font-medium text-purple-700">Premium Quality</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

                {/* Product Details Accordion */}
                <div className="space-y-3">
                  {product.ingredients && (
                    <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <summary className="font-semibold text-gray-800 cursor-pointer hover:text-amber-700">
                        Ingredients
                      </summary>
                      <p className="text-gray-600 mt-2 text-sm">{product.ingredients}</p>
                    </details>
                  )}
                  {product.benefits && (
                    <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <summary className="font-semibold text-gray-800 cursor-pointer hover:text-amber-700">
                        Benefits
                      </summary>
                      <p className="text-gray-600 mt-2 text-sm">{product.benefits}</p>
                    </details>
                  )}
                  {product.shelfLife && (
                    <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <summary className="font-semibold text-gray-800 cursor-pointer hover:text-amber-700">
                        Storage & Shelf Life
                      </summary>
                      <p className="text-gray-600 mt-2 text-sm">Shelf Life: {product.shelfLife}</p>
                    </details>
                  )}
                </div>
              </div>

              {/* ✅ Enhanced Quantity & Actions */}
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-800">Quantity:</span>
                  <div className="flex items-center bg-white border-2 border-amber-200 rounded-xl overflow-hidden shadow-sm">
                    <motion.button 
                      className="px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-lg transition-colors" 
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      -
                    </motion.button>
                    <span className="px-6 py-2 text-gray-900 font-bold text-lg bg-white min-w-[60px] text-center">
                      {qty}
                    </span>
                    <motion.button 
                      className="px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-lg transition-colors" 
                      onClick={() => setQty((q) => q + 1)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3">
                  <motion.button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl font-semibold text-lg" 
                    onClick={buyNow}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BoltIcon className="w-5 h-5 mr-3" />
                    Buy Now - ₹{(product.price * qty).toLocaleString()}
                  </motion.button>

                  <motion.button 
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl font-semibold text-lg" 
                    onClick={addMainToCart}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CartIcon className="w-5 h-5 mr-3" />
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ Clean Recommended Products Section - Vertical Scrollable */}
        {recommendedProducts.length > 0 && (
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                You May Also <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Like</span>
              </h2>
              <p className="text-gray-600">
                More delicious products from our collection
              </p>
            </div>

            {/* ✅ Clean Scrollable Cards Container */}
            <div className="relative">
              <div 
                className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-amber-100 scrollbar-thumb-amber-400 hover:scrollbar-thumb-amber-500 pr-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {recommendedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                      variants={fadeInUp}
                      whileHover={{ y: -4 }}
                      data-aos="fade-up"
                      data-aos-delay={index * 50}
                    >
                      <Link to={`/product/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <motion.button
                              className={`p-1.5 rounded-full ${
                                favorites.has(product.id) 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-white/80 text-gray-600 hover:text-red-500'
                              } backdrop-blur-sm transition-all shadow-md`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <HeartIcon filled={favorites.has(product.id)} />
                            </motion.button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                              Popular
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                          
                          <ProductRating 
                            rating={product.rating} 
                            reviewCount={product.reviewCount}
                            size={12}
                          />
                          
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="text-lg font-bold text-amber-600">₹{product.price}</span>
                              {product.originalPrice && (
                                <div className="text-gray-400 text-xs line-through">₹{product.originalPrice}</div>
                              )}
                            </div>
                            <motion.button
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addRecommended(product);
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Add
                            </motion.button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        details summary {
          list-style: none;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
        details summary::before {
          content: '▶';
          margin-right: 8px;
          transition: transform 0.2s;
        }
        details[open] summary::before {
          transform: rotate(90deg);
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-track-amber-100::-webkit-scrollbar-track {
          background-color: #fef3c7;
          border-radius: 10px;
        }
        .scrollbar-thumb-amber-400::-webkit-scrollbar-thumb {
          background-color: #fbbf24;
          border-radius: 10px;
        }
        .hover\\:scrollbar-thumb-amber-500:hover::-webkit-scrollbar-thumb {
          background-color: #f59e0b;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
      `}</style>
    </motion.div>
  );
};

export default ProductPage;
