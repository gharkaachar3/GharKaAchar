import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Professional Shimmer Loading Component
const ProductPageShimmer = () => (
  <div className="min-h-screen bg-amber-50 font-inter">
    <div className="w-full max-w-full px-4 py-8 mx-auto">
      <div className="flex items-center space-x-2 mb-8 overflow-hidden">
        <div className="w-16 h-4 bg-amber-200 rounded animate-pulse flex-shrink-0"></div>
        <div className="w-1 h-4 bg-amber-200 rounded animate-pulse flex-shrink-0"></div>
        <div className="w-24 h-4 bg-amber-200 rounded animate-pulse flex-shrink-0"></div>
      </div>
      
      <div className="space-y-8">
        <div className="w-full h-96 bg-amber-200 rounded-lg animate-pulse"></div>
        <div className="w-full h-32 bg-amber-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Professional Rating Component
const StarRating = ({ rating, reviewCount, size = 16 }) => {
  const stars = [];
  const fullStars = Math.floor(rating);

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className="text-amber-500 fill-current flex-shrink-0" width={size} height={size} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="text-gray-300 fill-current flex-shrink-0" width={size} height={size} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      <div className="flex items-center">
        {stars}
      </div>
      <span className="text-sm text-gray-600 font-medium tracking-wide">
        {rating} ({reviewCount || 0} ratings)
      </span>
    </div>
  );
};

// Original Product Component - NOT CHANGED
const CompleteProductCard = ({ product, qty, setQty, onAddToCart, onBuyNow, selectedImageIndex, setSelectedImageIndex }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 w-full max-w-full overflow-hidden">
      
      {/* Product Image Section */}
      <div className="p-6 pb-4">
        <div className="aspect-square overflow-hidden rounded-xl bg-amber-50 border border-amber-200 relative">
          <img 
            src={product.product_image || 'https://via.placeholder.com/600x600?text=Product+Image'}
            alt={product.product_name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
            }}
          />
          
          {/* Offer Badge */}
          {product.originalPrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase">
              {Math.round((1 - product.product_price / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Thumbnail Images */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {product.images.map((img, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all ${
                  selectedImageIndex === index 
                    ? 'border-amber-500 ring-2 ring-amber-200' 
                    : 'border-amber-200 hover:border-amber-300'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img 
                  src={img} 
                  alt={`${product.product_name} ${index + 1}`} 
                  className="w-full h-full object-cover rounded-md"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="px-6 space-y-5 max-w-full overflow-hidden">
        {/* Brand/Category */}
        <div className="text-sm text-amber-600 font-semibold tracking-wide uppercase truncate">
          {product.product_category || 'Pickles & Preserves'}
        </div>

        {/* Product Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight max-w-full font-inter">
          {product.product_name}
        </h1>
        
        {/* Rating */}
        {product.rating && (
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        )}

        {/* Special Price Tag */}
        <div className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
          Special Price
        </div>

        {/* Price Section */}
        <div className="space-y-3">
          <div className="flex items-baseline space-x-4 flex-wrap">
            <span className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">₹{product.product_price}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through font-medium">₹{product.originalPrice}</span>
            )}
            {product.originalPrice && (
              <span className="text-base text-amber-600 font-bold bg-amber-100 px-2 py-1 rounded-md">
                {Math.round((1 - product.product_price / product.originalPrice) * 100)}% off
              </span>
            )}
          </div>
          
          {/* Stock Info - Removed Free Delivery */}
          <div className="space-y-2 text-sm max-w-full">
            {product.product_quantity && (
              <div className="text-gray-700 font-medium">
                <span className="font-semibold">Size:</span> <span className="font-mono">{product.product_quantity}</span>
              </div>
            )}
            <div className="text-emerald-600 font-semibold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              In stock
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="border-t border-amber-200 pt-5">
          <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-wide">Product Highlights</h3>
          <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">•</span>
              <span className="font-medium">Authentic traditional recipe</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">•</span>
              <span className="font-medium">Premium quality ingredients</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">•</span>
              <span className="font-medium">No artificial preservatives</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">•</span>
              <span className="font-medium">Hygienic packaging</span>
            </li>
          </ul>
        </div>

        {/* Quantity Selector */}
        <div className="border-t border-amber-200 pt-5 pb-6">
          <div className="flex items-center space-x-4 mb-5 flex-wrap">
            <span className="text-base font-bold text-gray-900 flex-shrink-0 tracking-wide">Quantity:</span>
            <div className="flex items-center border-2 border-amber-300 rounded-xl overflow-hidden shadow-sm">
              <button 
                className="px-4 py-2 hover:bg-amber-50 text-gray-700 font-bold text-lg transition-colors min-w-[44px] h-12"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="px-6 py-2 font-black text-xl text-gray-900 bg-white min-w-[60px] text-center h-12 flex items-center justify-center">
                {qty}
              </span>
              <button 
                className="px-4 py-2 hover:bg-amber-50 text-gray-700 font-bold text-lg transition-colors min-w-[44px] h-12"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button 
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 px-8 rounded-xl font-bold text-base tracking-wide transition-colors shadow-md min-h-[56px] uppercase"
              onClick={onAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add to Cart
            </motion.button>

            <motion.button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-8 rounded-xl font-bold text-base tracking-wide transition-colors shadow-md min-h-[56px] uppercase"
              onClick={onBuyNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Buy Now
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ProductPage Component
const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { data, loading, error } = useSelector(state => state.getdata);
  const { isAuthencticated } = useSelector(state=>state.auth);
  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter product by ID from backend data
  const backendProducts = data?.data || [];
  const product = backendProducts.find(p => 
    String(p._id) === String(id) || String(p.id) === String(id)
  );
  
  const recommendedProducts = backendProducts
    .filter(p => String(p._id) !== String(id) && String(p.id) !== String(id))
    .slice(0, 8);

  // Loading state
  if (loading) {
    return <ProductPageShimmer />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 font-inter">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Something went wrong</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">We couldn't load the product details. Please try again.</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide transition-colors"
            >
              Try Again
            </button>
            <Link 
              to="/" 
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide transition-colors text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 font-inter">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Product Not Found</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">The product you're looking for doesn't exist or has been removed.</p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide transition-colors text-center"
            >
              Browse Products
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide transition-colors"
            >
              Go Back
            </button>
          </div>
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
    
    // Clean toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-amber-500 text-white px-5 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 text-sm font-semibold max-w-xs';
    toast.innerHTML = 'Item added to cart successfully';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const buyNowHandler = () => {
    addToCartHandler();
    setTimeout(() => {
      window.location.href = '/cart';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-amber-50 font-inter">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-amber-700 mb-8 space-x-2 overflow-x-auto">
          <Link to="/" className="hover:text-amber-800 transition-colors whitespace-nowrap font-medium">Home</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/" className="hover:text-amber-800 transition-colors whitespace-nowrap font-medium">Products</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-amber-900 truncate min-w-0 font-semibold">{product.product_name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 max-w-full overflow-hidden">
          <CompleteProductCard 
            product={product}
            qty={qty}
            setQty={setQty}
            onAddToCart={addToCartHandler}
            onBuyNow={buyNowHandler}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
          />

          {/* Product Description */}
          <div className="space-y-8 max-w-full overflow-hidden">
            {product.product_description && (
              <div className="bg-white rounded-xl border border-amber-200 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-wide">Product Details</h3>
                <p className="text-gray-700 leading-relaxed text-base break-words font-medium">{product.product_description}</p>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-xl border border-amber-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-wide">Specifications</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-amber-100">
                  <span className="text-gray-600 font-semibold">Brand</span>
                  <span className="font-bold text-gray-900">GharKaAchar</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-amber-100">
                  <span className="text-gray-600 font-semibold">Category</span>
                  <span className="font-bold text-gray-900">{product.product_category || 'Pickles'}</span>
                </div>
                {product.product_quantity && (
                  <div className="flex justify-between items-center py-3 border-b border-amber-100">
                    <span className="text-gray-600 font-semibold">Weight/Size</span>
                    <span className="font-mono font-bold text-gray-900">{product.product_quantity}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-semibold">Shelf Life</span>
                  <span className="font-bold text-gray-900">12 months</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Premium Cards for Recommended Products */}
       {/* ✅ Updated: You Should Like This Too */}
{recommendedProducts.length > 0 && (
  <motion.div className="container mx-auto py-16">
    <motion.div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        You should <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">like this too</span>
      </h2>
      <p className="text-gray-600 text-lg max-w-3xl mx-auto">
        More delicious products that perfectly complement your selection
      </p>
    </motion.div>

    <motion.div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {recommendedProducts.map((product, index) => (
        <motion.div
          key={product._id}
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
                      Popular
                    </motion.div>
                  )}
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

                <StarRating 
                  rating={product.rating || 4.5} 
                  reviewCount={product.reviewCount || Math.floor(Math.random() * 100) + 20}
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
                      dispatch(addToCart({
                        id: product._id,
                        name: product.product_name,
                        price: product.product_price,
                        image: product.product_image,
                        qty: 1,
                      }));
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add
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
    </div>
  );
};

export default ProductPage;
