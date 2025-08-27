import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";

// Icons (same)
const UserIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);

const CartIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17
      m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

const BackIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
  </svg>
);

const CleanHeader = ({ cartCount = 0 }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();


  // ✅ FIXED - Safe Redux selectors with fallbacks
  const { data = {} } = useSelector((s) => s.getdata || {});
  const products = data?.data || []; // Backend data from data.data
  const { cart = [] } = useSelector((s) => s.cart || {});

  // ✅ FIXED - Safe cart count calculation
  const finalCartCount = cartCount || (Array.isArray(cart) ? cart.reduce((sum, i) => sum + (i.qty || 1), 0) : 0);

  // Fuse.js setup - Fixed to use backend data structure
  const fuse = React.useMemo(() => {
    return new Fuse(products, {
      keys: [
        { name: "product_name", weight: 0.7 },
        { name: "product_category", weight: 0.2 },
        { name: "product_description", weight: 0.1 }
      ],
      threshold: 0.4,
      distance: 100,
      includeScore: true,
      minMatchCharLength: 2
    });
  }, [products]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search logic with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      
      const results = fuse.search(searchQuery).slice(0, 8);
      setSearchResults(results);
      setSelectedIndex(-1);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fuse]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  // Mobile search focus effect
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Prevent body scroll when mobile search is open
  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobileSearchOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((!isSearchOpen && !isMobileSearchOpen) || searchResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleProductSelect(searchResults[selectedIndex].item);
          }
          break;
        case 'Escape':
          setIsSearchOpen(false);
          setIsMobileSearchOpen(false);
          setSelectedIndex(-1);
          searchRef.current?.blur();
          mobileSearchRef.current?.blur();
          break;
      }
    };

    if (isSearchOpen || isMobileSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSearchOpen, isMobileSearchOpen, searchResults, selectedIndex]);

  // Handle product selection
  const handleProductSelect = useCallback((product) => {
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);
    navigate(`/product/${product._id || product.id}`);
  }, [navigate]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
    if (window.innerWidth < 768) {
      mobileSearchRef.current?.focus();
    } else {
      searchRef.current?.focus();
    }
  };

  // Open mobile search
  const openMobileSearch = () => {
    setIsMobileSearchOpen(true);
    setIsMobileMenuOpen(false);
  };

  // Close mobile search
  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  return (
    <>
      {/* Main Header */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md text-gray-900" 
            : "bg-amber-800 text-white shadow-sm"
        }`}
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-2 sm:px-4 py-3 flex items-center justify-between gap-2">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-amber-700 transition-colors flex-shrink-0"
          >
            <MenuIcon />
          </button>

          {/* Logo - Fixed Visibility */}
          <Link to="/" className="flex-shrink-0 min-w-0">
            <div className="group cursor-pointer">
              {/* Desktop Logo */}
              <div className="hidden sm:block">
                <span className={`font-bold font-serif text-xl lg:text-2xl tracking-tight select-none transition-all duration-300 group-hover:scale-105 ${
                  isScrolled 
                    ? "text-amber-800 drop-shadow-sm"
                    : "text-white drop-shadow-sm"
                }`}>
                  <span className="relative">
                    Ghar
                    <span className={`${isScrolled ? 'text-amber-600' : 'text-amber-200'} font-extrabold`}>Ka</span>
                    Achar
                    <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r transition-all duration-300 group-hover:w-full ${
                      isScrolled 
                        ? 'from-amber-500 to-amber-700 w-0' 
                        : 'from-amber-300 to-amber-100 w-0'
                    }`}></div>
                  </span>
                </span>
              </div>

              {/* Mobile Logo - Fixed */}
              <div className="block sm:hidden">
                <span className={`font-bold font-serif text-base tracking-tight select-none transition-all duration-300 ${
                  isScrolled 
                    ? "text-amber-800 drop-shadow-sm"
                    : "text-white drop-shadow-sm"
                }`}>
                  <span className="block leading-tight">
                    <span>Ghar</span>
                    <span className={`${isScrolled ? 'text-amber-600' : 'text-amber-200'} font-extrabold`}>Ka</span>
                  </span>
                  <span className="block leading-tight -mt-0.5">Achar</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="relative w-full max-w-md mx-2 lg:mx-6 flex-1 hidden md:block">
            <div className={`flex items-center gap-2 bg-white rounded-full shadow px-3 py-2 ring-1 ring-amber-200 transition-all duration-200 ${
              isSearchOpen ? "ring-2 ring-amber-500 shadow-lg" : ""
            }`}>
              <SearchIcon />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search pickles, chutneys..."
                className="bg-transparent outline-none flex-1 text-gray-800 font-medium placeholder-gray-400"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <CloseIcon />
                </button>
              )}
            </div>

            {/* Desktop Search Results */}
            <AnimatePresence>
              {isSearchOpen && searchResults.length > 0 && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-amber-100 rounded-xl shadow-xl overflow-hidden z-[60] max-h-96 overflow-y-auto"
                >
                  {searchResults.map(({ item }, idx) => (
                    <Link to={"/product/"+item._id}>
                    <button
                      key={`${item._id || item.id}-${idx}`}
                      onClick={() => handleProductSelect(item)}
                      className={`w-full text-left hover:bg-amber-50 px-4 py-3 transition-colors duration-150 border-b border-amber-50 last:border-b-0 ${
                        selectedIndex === idx ? 'bg-amber-100' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name} 
                            className="h-10 w-10 rounded-lg mr-3 border border-amber-100 object-cover flex-shrink-0" 
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {item.product_name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.product_category && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                {item.product_category}
                              </span>
                            )}
                            {item.product_price && (
                              <span className="text-sm font-medium text-green-600">
                                ₹{item.product_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop No Results */}
            {isSearchOpen && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="absolute left-0 right-0 mt-2 bg-white border border-amber-100 rounded-xl shadow-lg p-4 z-[60]"
              >
                <div className="text-center">
                  <SearchIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    No products found for "<span className="font-medium">{searchQuery}</span>"
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile & Desktop Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={openMobileSearch}
              className={`md:hidden p-2 rounded-md transition-colors duration-200 ${
                isScrolled 
                  ? "hover:bg-gray-100 text-gray-700" 
                  : "hover:bg-amber-700 text-white"
              }`}
            >
              <SearchIcon />
            </button>

            {/* Profile Button */}
            <Link to="/profile">
              <button className={`p-2 rounded-md transition-colors duration-200 ${
                isScrolled 
                  ? "hover:bg-gray-100 text-gray-700" 
                  : "hover:bg-amber-700 text-white"
              }`}>
                <UserIcon />
              </button>
            </Link>
            
            {/* Cart Button */}
            <Link to="/cart" className={`p-2 rounded-md transition-colors duration-200 relative ${
              isScrolled 
                ? "hover:bg-gray-100 text-gray-700" 
                : "hover:bg-amber-700 text-white"
            }`}>
              <CartIcon />
              {finalCartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px]"
                >
                  {finalCartCount > 99 ? "99+" : finalCartCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-amber-700 bg-amber-800"
            >
              <div className="container mx-auto px-4 py-4 space-y-3">
                <Link 
                  to="/" 
                  className="block text-white hover:text-amber-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/categories" 
                  className="block text-white hover:text-amber-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link 
                  to="/profile" 
                  className="block text-white hover:text-amber-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[70] md:hidden"
          >
            {/* Mobile Search Header */}
            <div className="bg-amber-800 text-white px-4 py-3 flex items-center gap-3">
              <button
                onClick={closeMobileSearch}
                className="p-2 hover:bg-amber-700 rounded-md transition-colors"
              >
                <BackIcon />
              </button>
              <div className="flex-1 relative">
                <div className="flex items-center gap-2 bg-white rounded-full shadow px-3 py-2">
                  <SearchIcon className="text-gray-600" />
                  <input
                    ref={mobileSearchRef}
                    type="text"
                    placeholder="Search products..."
                    className="bg-transparent outline-none flex-1 text-gray-800 font-medium placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <CloseIcon className="text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search Results */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map(({ item }, idx) => (
                    <button
                      key={`mobile-${item._id || item.id}-${idx}`}
                      onClick={() => handleProductSelect(item)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors duration-150 ${
                        selectedIndex === idx 
                          ? 'bg-amber-50 border-amber-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name} 
                            className="h-12 w-12 rounded-lg border border-gray-200 object-cover flex-shrink-0" 
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-base mb-1">
                            {item.product_name}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.product_category && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                {item.product_category}
                              </span>
                            )}
                            {item.product_price && (
                              <span className="text-sm font-medium text-green-600">
                                ₹{item.product_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="text-center py-12">
                  <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">
                    No products found for "<span className="font-medium">{searchQuery}</span>"
                  </p>
                  <p className="text-sm text-gray-400">
                    Try different keywords or browse categories
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Start typing to search</p>
                  <p className="text-sm text-gray-400">
                    Search for pickles, chutneys, and more...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CleanHeader;
