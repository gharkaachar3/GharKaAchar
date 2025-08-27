import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Icons (same as before)
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

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const EmptyBoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L4 6l5 5" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
    <div className="text-center">
      <motion.div
        className="w-16 h-16 border-4 border-amber-300 border-t-amber-600 rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.h2 
        className="text-2xl font-bold text-amber-700 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading GharKaAchar
      </motion.h2>
      <motion.p 
        className="text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Preparing fresh content for you...
      </motion.p>
    </div>
  </div>
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

// Toast Component
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

export default function Homes() {
  const [localLoading, setLocalLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [favorites, setFavorites] = useState(new Set());
  const [peopleAlsoLoved, setPeopleAlsoLoved] = useState([]);

  const { sampleProducts, recommendedProducts, cart } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const { data, error, loading, categories, banners } = useSelector(state => state.getdata);
  
  console.log('Redux State:', {
    data: data,
    loading: loading,
    error: error,
    localLoading: localLoading
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
    });

    if (data?.data && data.data.length > 0) {
      const shuffled = [...data.data].sort(() => 0.5 - Math.random());
      setPeopleAlsoLoved(shuffled.slice(0, 5));
    }

    const timer = setTimeout(() => {
      console.log('Local loading timer completed');
      setLocalLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [data]);

  const isLoading = localLoading || loading || !data || (data && (!data.data || data.data.length === 0));

  console.log('Loading States:', {
    localLoading,
    reduxLoading: loading,
    hasData: !!data?.data?.length,
    isLoading
  });

  const handleAdd = (p) => {
    dispatch(addToCart({ 
      id: p._id || p.id, 
      name: p.product_name || p.name, 
      price: p.product_price || p.price, 
      image: p.product_image || p.image, 
      qty: 1 
    }));
    setToast({ message: `🛒 ${p.product_name || p.name} added to cart!`, type: 'success' });
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
    setVisibleProducts(prev => Math.min(prev + 4, data?.data?.length || 0));
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading && !error) {
    console.log('Showing loading state');
    return <LoadingSpinner />;
  }

  // Error State
  if (error) {
    console.log('Showing error state:', error);
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            className="text-red-500 mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AlertIcon />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 text-lg text-center max-w-md mb-8">
            We couldn't load the products right now. Please refresh the page to try again.
          </p>
          <motion.button
            onClick={handleRefresh}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshIcon />
            Refresh Page
          </motion.button>
          {error.message && (
            <p className="text-sm text-red-500 mt-4 text-center">
              Error: {error.message}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // No Data State
  if (!data?.data || data.data.length === 0) {
    console.log('Showing no data state');
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            className="text-amber-600 mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyBoxIcon />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            No Products Available
          </h2>
          <p className="text-gray-600 text-lg text-center max-w-md mb-8">
            We're currently updating our inventory. Please check back later for fresh pickles and chutneys!
          </p>
          <motion.button
            onClick={handleRefresh}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshIcon />
            Check Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // SUCCESS STATE - Show actual content
  console.log('Showing main content with data:', data.data.length, 'products');
  
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
      
      {/* Banner Carousel */}
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
        >
          {(banners?.data?.length > 0 ? banners.data : data.data.slice(0, 5)).map((banner, index) => (
            <motion.div 
              key={banner._id || banner.id || index} 
              className="h-full w-full relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={banner.banner_image || banner.product_image || banner.image}
                alt={banner.banner_category || banner.product_name || banner.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <motion.div 
                className="absolute bottom-8 left-8 text-white z-20"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-2">
                  {banner.banner_category || banner.product_name || banner.name}
                </h3>
                <p className="text-amber-200 text-lg mb-4">
                  Premium Quality Products
                </p>
                <motion.button
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => banner.product_price && handleAdd(banner)}
                >
                  {banner.product_price ? `Order Now - ₹${banner.product_price}` : 'Explore Collection'}
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </Carousel>
      </motion.div>

      {/* Categories Section */}
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
          <motion.div 
            className="flex overflow-x-auto overflow-y-hidden gap-6 sm:gap-8 pb-8 scroll-smooth hide-scrollbar snap-x snap-mandatory"
            variants={staggerContainer}
          >
            {(categories?.data?.length > 0 ? categories.data : data.data.slice(0, 8)).map((category, index) => (
              <Link key={category._id || category.id || index} to={`/category/${category.category_name || category.product_category || category.category}`}>
                <motion.div
                  className="flex flex-col items-center flex-shrink-0 w-40 sm:w-44 lg:w-48 group cursor-pointer snap-start"
                  variants={fadeInUp}
                  whileHover={{ y: -12 }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
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
                      src={category.category_image || category.product_image || category.image}
                      alt={category.category_name || category.product_name || category.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                    >
                      <span className="bg-white/90 backdrop-blur-md text-amber-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-amber-200">
                        Explore
                      </span>
                    </motion.div>

                    <motion.div 
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1 + 0.5, type: "spring", bounce: 0.5 }}
                    >
                      {index + 1}
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="text-center space-y-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg group-hover:text-amber-700 transition-colors duration-300">
                      {category.category_name || category.product_category || category.category}
                    </h3>
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ✅ FIXED: People Also Loved Section */}
      {peopleAlsoLoved.length > 0 && (
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

            <motion.div 
              className="flex overflow-x-auto overflow-y-hidden gap-4 sm:gap-6 pb-6 scroll-smooth hide-scrollbar"
              variants={staggerContainer}
            >
              {peopleAlsoLoved.map((product, index) => (
                <motion.div
                  key={product._id}
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
                  <Link to={`/product/${product._id}`}>
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2">
                        <motion.button
                          className={`p-1.5 rounded-full ${
                            favorites.has(product._id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/80 text-gray-600 hover:text-red-500'
                          } backdrop-blur-sm transition-all shadow-md`}
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
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                          Popular
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-tight">
                        {product.product_name}
                      </h3>
                      
                      {product.product_description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                          {product.product_description}
                        </p>
                      )}
                      
                      <ProductRating 
                        rating={product.rating} 
                        reviewCount={product.reviewCount}
                        size={12}
                      />
                      
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-bold text-amber-600">₹{product.product_price}</span>
                          {product.product_quantity && (
                            <div className="text-gray-500 text-xs">{product.product_quantity}</div>
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
      )}

      {/* ✅ FIXED: Premium Products Grid */}
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

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          variants={staggerContainer}
        >
          {data.data.slice(0, visibleProducts).map((product, index) => (
            <motion.div
              key={product._id}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              data-aos="fade-up"
              data-aos-delay={index * 100}
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
                      {product.product_category === "Specialty" && (
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

        {/* Load More Button */}
        {visibleProducts < data.data.length && (
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

      {/* Footer */}
      <motion.footer 
        className="bg-gradient-to-r from-amber-900 via-orange-900 to-red-900 text-white pt-16 pb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Logo + Instagram Icon */}
            <motion.div className="lg:col-span-1" variants={fadeInUp}>
              <motion.h2 
                className="text-4xl font-bold font-serif mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                GharKaAchar
              </motion.h2>
              <p className="text-amber-100 mb-6 text-lg leading-relaxed">
                Authentic Indian pickles and traditional foods crafted with love and generations-old recipes.
              </p>
              
              {/* Only Instagram Icon */}
              <motion.a
                href="https://instagram.com/gharkachar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-pink-600 transition-all duration-300 hover:scale-110"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <InstagramIcon />
                <span className="ml-3 font-medium">Follow Us</span>
              </motion.a>
            </motion.div>

            {/* Backend Categories */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-bold mb-6 text-yellow-300">Our Categories</h3>
              <ul className="space-y-4">
                {(categories?.data?.length > 0 ? categories.data : data.data.slice(0, 8).map((item, index) => ({
                  _id: item._id || index,
                  category_name: item.product_category || item.category || `Category ${index + 1}`
                }))).map((category) => (
                  <motion.li key={category._id}>
                    <Link
                      to={`/category/${category.category_name || category.product_category || category.category}`}
                      className="text-amber-100 hover:text-white transition-colors flex items-center group"
                    >
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 8 }}
                        className="flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {category.category_name || category.product_category || category.category}
                      </motion.div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-bold mb-6 text-yellow-300">Quick Links</h3>
              <ul className="space-y-4">
                {['Home', 'About Us', 'Contact', 'Privacy Policy'].map((link) => (
                  <motion.li key={link}>
                    <motion.a
                      href="#"
                      className="text-amber-100 hover:text-white transition-colors flex items-center group"
                    >
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 8 }}
                        className="flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {link}
                      </motion.div>
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Copyright Section */}
          <motion.div 
            className="border-t border-white/20 my-12"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          />

          <motion.div 
            className="text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-amber-200 text-lg">
              &copy; {new Date().getFullYear()} GharKaAchar. All rights reserved. Made with ❤️ in India
            </p>
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
