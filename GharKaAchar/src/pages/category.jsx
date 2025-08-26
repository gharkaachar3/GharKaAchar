import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Icons
const CartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);

// Enhanced Toast Component
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
      } text-white font-medium min-w-[300px]`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-green-400' : 'bg-red-400'
        }`}>
          {type === 'success' ? '✓' : '✕'}
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

// Star Rating Component
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

const ProductRating = ({ rating, reviewCount, size = 14 }) => {
  if (!rating || rating === 0 || rating === null || rating === undefined || isNaN(rating)) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 mb-3">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            filled={i < Math.floor(rating)} 
            size={size}
          />
        ))}
      </div>
      <span className="text-xs text-gray-600 ml-1">
        ({rating.toFixed(1)})
      </span>
      {reviewCount && (
        <span className="text-xs text-gray-400">
          • {reviewCount} reviews
        </span>
      )}
    </div>
  );
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function CategoryProducts() {
  const { categoryName } = useParams();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState('name');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const dispatch = useDispatch();
  const { data, error } = useSelector(state => state.getdata);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
    });

    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data?.data) {
      // Filter products based on category
      let categoryProducts = data.data.filter(product => 
        product.product_category?.toLowerCase() === categoryName?.toLowerCase() ||
        product.category?.toLowerCase() === categoryName?.toLowerCase()
      );

      // Apply price filter
      if (filterPrice !== 'all') {
        if (filterPrice === 'low') {
          categoryProducts = categoryProducts.filter(p => p.product_price < 200);
        } else if (filterPrice === 'medium') {
          categoryProducts = categoryProducts.filter(p => p.product_price >= 200 && p.product_price <= 500);
        } else if (filterPrice === 'high') {
          categoryProducts = categoryProducts.filter(p => p.product_price > 500);
        }
      }

      // Apply sorting
      if (sortBy === 'price-low') {
        categoryProducts.sort((a, b) => a.product_price - b.product_price);
      } else if (sortBy === 'price-high') {
        categoryProducts.sort((a, b) => b.product_price - a.product_price);
      } else if (sortBy === 'name') {
        categoryProducts.sort((a, b) => a.product_name.localeCompare(b.product_name));
      }

      setFilteredProducts(categoryProducts);
    }
  }, [data, categoryName, sortBy, filterPrice]);

  const handleAdd = (product) => {
    dispatch(addToCart({ 
      id: product._id || product.id, 
      name: product.product_name || product.name, 
      price: product.product_price || product.price, 
      image: product.product_image || product.image, 
      qty: 1 
    }));
    setToast({ message: `🛒 ${product.product_name || product.name} added to cart!`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        setToast({ message: '💔 Removed from favorites', type: 'success' });
      } else {
        newFavorites.add(productId);
        setToast({ message: '❤️ Added to favorites!', type: 'success' });
      }
      setTimeout(() => setToast(null), 2000);
      return newFavorites;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Shimmer */}
          <div className="mb-8">
            <div className="w-64 h-8 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
            </div>
            <div className="w-96 h-4 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
            </div>
          </div>

          {/* Filters Shimmer */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-32 h-10 bg-gradient-to-r from-amber-200 to-orange-200 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
              </div>
            ))}
          </div>

          {/* Products Grid Shimmer */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg border border-amber-200/50">
                <div className="aspect-square bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
                </div>
                <div className="p-4">
                  <div className="w-full h-4 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
                  </div>
                  <div className="w-3/4 h-3 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-6 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
                    </div>
                    <div className="w-12 h-8 bg-gradient-to-r from-orange-300 to-amber-300 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-smooth transform -skew-x-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 capitalize">
            {categoryName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Collection</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Explore our premium {categoryName?.toLowerCase()} selection - {filteredProducts.length} products found
          </p>
          
          {/* Breadcrumb */}
          <nav className="flex mt-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-amber-600 font-medium capitalize">{categoryName}</span>
          </nav>
        </motion.div>

        {/* Filters & Sort */}
        <motion.div 
          className="flex flex-wrap gap-4 mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-amber-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <FilterIcon />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>
          
          {/* Sort By */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {/* Price Filter */}
          <select 
            value={filterPrice} 
            onChange={(e) => setFilterPrice(e.target.value)}
            className="px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Prices</option>
            <option value="low">Under ₹200</option>
            <option value="medium">₹200 - ₹500</option>
            <option value="high">Above ₹500</option>
          </select>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <Link to={`/product/${product._id}`}>
                  <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 transform hover:scale-[1.02]">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                        {product.product_category === "Premium" && (
                          <motion.div 
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            🔥 Premium
                          </motion.div>
                        )}
                        <motion.button
                          className={`ml-auto p-1.5 rounded-full ${
                            favorites.has(product._id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/80 text-gray-600 hover:text-red-500'
                          } backdrop-blur-sm transition-all shadow-md opacity-0 group-hover:opacity-100`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product._id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <HeartIcon />
                        </motion.button>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-3 sm:p-4 lg:p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-amber-700 transition-colors flex-1">
                          {product.product_name}
                        </h3>
                        {product.product_quantity && (
                          <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs px-2 py-1 rounded-full ml-2 font-semibold flex-shrink-0">
                            {product.product_quantity}
                          </span>
                        )}
                      </div>

                      {product.product_description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                          {product.product_description}
                        </p>
                      )}

                      <ProductRating 
                        rating={product.rating} 
                        reviewCount={product.reviewCount}
                        size={14}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-700">₹{product.product_price}</span>
                          {product.product_price && (
                            <span className="text-gray-400 text-xs sm:text-sm line-through">₹{Math.floor(product.product_price * 1.5)}</span>
                          )}
                        </div>
                        <motion.button
                          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-xs sm:text-sm font-semibold flex items-center transition-all shadow-lg hover:shadow-xl"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAdd(product);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CartIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Add
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-amber-600 mb-6">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L4 6l5 5" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No Products Found
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Sorry, we couldn't find any products in the {categoryName} category.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Browse All Products
            </Link>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes shimmer-smooth {
          0% { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%) skewX(-12deg); opacity: 0; }
        }
        .animate-shimmer-smooth {
          animation: shimmer-smooth 2.5s ease-in-out infinite;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .aspect-square {
          aspect-ratio: 1 / 1;
        }
      `}</style>
    </motion.div>
  );
}
