import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CleanHeader from './Header';

// Icons (keeping original)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const CartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// ✅ Enhanced Star Rating Component with Dynamic Rendering
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

// ✅ Dynamic Rating Component - Only Shows if Rating Exists
const ProductRating = ({ rating, reviewCount, size = 14 }) => {
  // Only render if rating exists and is valid
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

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <motion.div
      className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
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

const scaleOnHover = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { scale: 0.95 }
};

export default function Homes() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [favorites, setFavorites] = useState(new Set());

  const { sampleProducts, recommendedProducts, cart } = useSelector((s) => s.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
    });

    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = (p) => {
    dispatch(addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 }));
    setToast({ message: `🛒 ${p.name} added to cart!`, type: 'success' });
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

  const loadMoreProducts = () => {
    setVisibleProducts(prev => Math.min(prev + 4, sampleProducts.length));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-20 h-20 border-6 border-amber-200 border-t-amber-600 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-amber-800 mb-2">GharKaAchar</h2>
            <p className="text-amber-600 text-lg">Loading delicious products...</p>
          </motion.div>
        </motion.div>
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
      
      {/* Enhanced Banner Carousel */}
      <motion.div 
        className="h-[40vh] md:h-[50vh] w-full bg-gradient-to-r from-amber-800 to-orange-800 overflow-hidden relative"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <Carousel
          showArrows={true}
          showStatus={false}
          showIndicators={true}
          infiniteLoop={true}
          autoPlay={true}
          interval={4000}
          showThumbs={false}
          className="h-full w-full"
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <motion.button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <motion.button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )
          }
          renderIndicator={(onClickHandler, isSelected, index, label) => (
            <motion.button
              className={`inline-block w-3 h-3 mx-1 rounded-full transition-all ${
                isSelected ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={onClickHandler}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`${label} ${index + 1}`}
            />
          )}
        >
          {sampleProducts.slice(0, 5).map((product, index) => (
            <motion.div 
              key={product.id} 
              className="h-full w-full relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <motion.div 
                className="absolute bottom-8 left-8 text-white z-20"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h3>
                <p className="text-amber-200 text-lg mb-4">{product.category}</p>
                <motion.button
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAdd(product)}
                >
                  Order Now - ₹{product.price}
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </Carousel>
      </motion.div>

{/* ✅ Enhanced Categories Section - Clean & Simple */}
<motion.div 
  className="container mx-auto px-4 py-16 overflow-hidden"
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  <motion.div className="text-center mb-16" variants={fadeInUp}>
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
      Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Categories</span>
    </h2>
    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
      Discover authentic flavors crafted with traditional recipes and premium ingredients passed down through generations
    </p>
    <motion.div 
      className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-6 rounded-full"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8, duration: 0.8 }}
    />
  </motion.div>

  <div className="relative">
    {/* ✅ Clean Horizontal Scrollable Container */}
    <motion.div 
      className="flex overflow-x-auto overflow-y-hidden gap-6 sm:gap-8 pb-8 scroll-smooth hide-scrollbar snap-x snap-mandatory"
      variants={staggerContainer}
      style={{
        scrollPadding: '0 20px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {sampleProducts.map((product, index) => (
        <motion.div
          key={product.id}
          className="flex flex-col items-center flex-shrink-0 w-40 sm:w-44 lg:w-48 group cursor-pointer snap-start"
          variants={fadeInUp}
          whileHover={{ y: -12 }}
          data-aos="fade-up"
          data-aos-delay={index * 100}
        >
          {/* ✅ Enhanced Category Image Container */}
          <motion.div 
            className="relative h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36 rounded-full overflow-hidden border-4 border-amber-300 group-hover:border-amber-500 transition-all duration-500 shadow-lg group-hover:shadow-2xl mb-6"
            whileHover={{ 
              scale: 1.08,
              boxShadow: "0 25px 50px rgba(245, 158, 11, 0.25)",
              borderColor: "#D97706"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
            />
            
            {/* ✅ Enhanced Overlay Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* ✅ Improved Hover Label */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
            >
              <span className="bg-white/90 backdrop-blur-md text-amber-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-amber-200">
                Explore
              </span>
            </motion.div>

            {/* ✅ Category Badge */}
            <motion.div 
              className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 + 0.5, type: "spring", bounce: 0.5 }}
            >
              {index + 1}
            </motion.div>

            {/* ✅ Pulse Ring Effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400/50 scale-110"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0, 0.6, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          </motion.div>

          {/* ✅ Clean Category Info */}
          <motion.div 
            className="text-center space-y-2"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="font-bold text-gray-800 text-base sm:text-lg group-hover:text-amber-700 transition-colors duration-300">
              {product.category}
            </h3>
            <p className="text-amber-600 text-sm font-medium leading-tight">
              {product.name}
            </p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>

    {/* ✅ Navigation Dots (Optional) */}
    <motion.div 
      className="flex justify-center mt-8 space-x-2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1 }}
    >
      {sampleProducts.slice(0, 5).map((_, index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full bg-amber-300"
          whileHover={{ scale: 1.5, backgroundColor: "#D97706" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 1.2 }}
        />
      ))}
    </motion.div>
  </div>
</motion.div>

{/* ✅ People Also Viewed Section - Horizontal X-axis Scrollable */}
<motion.div 
  className="bg-white/50 backdrop-blur-sm py-12"
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  <div className="container mx-auto px-4">
    <motion.div className="text-center mb-12" variants={fadeInUp}>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        People Also <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Loved</span>
      </h2>
      <p className="text-gray-600 text-lg">
        Trending favorites picked by our community
      </p>
    </motion.div>

    {/* ✅ Horizontal Scrollable Container */}
    <motion.div 
      className="flex overflow-x-auto overflow-y-hidden gap-4 sm:gap-6 pb-6 scroll-smooth hide-scrollbar"
      variants={staggerContainer}
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: '#D97706 #F3F4F6'
      }}
    >
      {recommendedProducts.map((product, index) => (
        <motion.div
          key={product.id}
          className="flex-shrink-0 w-48 sm:w-56 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
          variants={fadeInUp}
          whileHover={{ 
            y: -8,
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)" 
          }}
          whileTap={{ scale: 0.98 }}
          data-aos="fade-right"
          data-aos-delay={index * 100}
        >
          <Link to={`/product/${product.id}`}>
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
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
                  <HeartIcon />
                </motion.button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  Popular
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-tight">
                {product.name}
              </h3>
              
              {/* ✅ Dynamic Rating - Only shows if product has rating */}
              <ProductRating 
                rating={product.rating} 
                reviewCount={product.reviewCount}
                size={12}
              />
              
              <div className="flex items-center justify-between mt-3">
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
                    handleAdd(product);
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
</motion.div>



      {/* ✅ Enhanced Premium Products Grid - Mobile 2 Cards Layout */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Premium</span> Products
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Handpicked selection of our finest products, made with authentic recipes passed down through generations
          </p>
        </motion.div>

        {/* ✅ Mobile-First Grid: 2 cards per row on mobile, responsive scaling */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          variants={staggerContainer}
        >
          {sampleProducts.slice(0, visibleProducts).map((product, index) => (
            <motion.div
              key={product.id}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <Link to={`/product/${product.id}`}>
                <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 transform hover:scale-[1.02]">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Badges and Actions */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                      {product.category === "Specialty" && (
                        <motion.div 
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          🔥 Popular
                        </motion.div>
                      )}
                      <motion.button
                        className={`ml-auto p-1.5 rounded-full ${
                          favorites.has(product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/80 text-gray-600 hover:text-red-500'
                        } backdrop-blur-sm transition-all shadow-md opacity-0 group-hover:opacity-100`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <HeartIcon />
                      </motion.button>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-amber-700 transition-colors flex-1">
                        {product.name}
                      </h3>
                      {product.weight && (
                        <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs px-2 py-1 rounded-full ml-2 font-semibold flex-shrink-0">
                          {product.weight}
                        </span>
                      )}
                    </div>

                    {product.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* ✅ Dynamic Rating - Only shows if product has rating */}
                    <ProductRating 
                      rating={product.rating} 
                      reviewCount={product.reviewCount}
                      size={14}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-700">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-gray-400 text-xs sm:text-sm line-through">₹{product.originalPrice}</span>
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

        {/* Enhanced Load More Button */}
        {visibleProducts < sampleProducts.length && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
              onClick={loadMoreProducts}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Load More Products
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Footer */}
      <motion.footer 
        className="bg-gradient-to-r from-amber-900 via-orange-900 to-red-900 text-white pt-16 pb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Enhanced Brand Info */}
            <motion.div className="lg:col-span-2" variants={fadeInUp}>
              <motion.h2 
                className="text-4xl font-bold font-serif mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                GharKaAchar
              </motion.h2>
              <p className="text-amber-100 mb-6 text-lg leading-relaxed">
                Authentic Indian pickles and traditional foods crafted with love and generations-old recipes. 
                Experience the taste of home, delivered fresh to your doorstep.
              </p>
              <div className="flex space-x-6">
                {[
                  { icon: 'facebook', color: 'hover:bg-blue-600' },
                  { icon: 'instagram', color: 'hover:bg-pink-600' },
                  { icon: 'twitter', color: 'hover:bg-blue-400' }
                ].map((social, index) => (
                  <motion.a
                    key={social.icon}
                    href="#"
                    className={`p-3 rounded-full bg-white/10 backdrop-blur-sm text-white ${social.color} transition-all duration-300 hover:scale-110`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Quick Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-bold mb-6 text-yellow-300">Quick Links</h3>
              <ul className="space-y-4">
                {['Home', 'Shop', 'About Us', 'Contact', 'FAQ'].map((link) => (
                  <motion.li key={link}>
                    <motion.a
                      href="#"
                      className="text-amber-100 hover:text-white transition-colors flex items-center group"
                      whileHover={{ x: 8 }}
                    >
                      <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Enhanced Categories */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-bold mb-6 text-yellow-300">Categories</h3>
              <ul className="space-y-4">
                {['Pickles', 'Chutneys', 'Papads', 'Desserts', 'Specialty Items'].map((category) => (
                  <motion.li key={category}>
                    <motion.a
                      href="#"
                      className="text-amber-100 hover:text-white transition-colors flex items-center group"
                      whileHover={{ x: 8 }}
                    >
                      <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {category}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Enhanced Divider */}
          <motion.div 
            className="border-t border-white/20 my-12"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          />

          {/* Enhanced Copyright */}
          <motion.div 
            className="text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-amber-200 text-lg mb-4">
              &copy; {new Date().getFullYear()} GharKaAchar. All rights reserved. Made with ❤️ in India
            </p>
            <div className="flex flex-wrap justify-center space-x-8">
              {['Privacy Policy', 'Terms of Service', 'Shipping Policy', 'Return Policy'].map((policy) => (
                <motion.a
                  key={policy}
                  href="#"
                  className="text-amber-300 hover:text-white transition-colors text-sm"
                  whileHover={{ y: -2, scale: 1.05 }}
                >
                  {policy}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.footer>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
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
