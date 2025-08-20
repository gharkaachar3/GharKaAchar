import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link, Navigate, useNavigate } from 'react-router'; // fixed
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartSlice'; // adjust path if needed

// Icons
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

const TrackOrderIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
</svg>
);

export default function Homes() {

// Get global arrays and cart from Redux
const { sampleProducts, recommendedProducts, cart } = useSelector((s) => s.cart);
const dispatch = useDispatch();

const handleAdd = (p) => {
dispatch(addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 }));
};

// Total qty for badge
// const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
// const count = cart.filter((items)=>items._id)

return (
<div className="min-h-screen bg-amber-50">
{/* Header */}
{/* <header className="sticky top-0 z-50 bg-amber-800 text-amber-50 shadow-md">
<div className="container mx-auto px-4 py-3 flex items-center justify-between">
<button
className="p-2 rounded-md hover:bg-amber-700 transition-colors md:hidden"
onClick={() => setIsMenuOpen(!isMenuOpen)}
>
<MenuIcon />
</button>

      <h1 className="text-xl md:text-2xl font-bold font-serif">GharKaAchar</h1>

      <div className="flex items-center space-x-4">
        <button className="hidden md:flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-amber-700 transition-colors">
          <TrackOrderIcon />
          <span className="text-sm md:text-base">Track Order</span>
        </button>
        <button className="p-2 rounded-md hover:bg-amber-700 transition-colors">
          <UserIcon />
        </button>
        <Link to={'/cart'} className="p-2 rounded-md hover:bg-amber-700 transition-colors relative"  >
          <CartIcon />
          <span className="absolute -top-1 -right-1 bg-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        </Link>
      </div>
    </div>
  </header> */}

  {/* Smaller Banner Carousel */}
  <div className="h-[30vh] w-full bg-amber-800 overflow-hidden">
    <Carousel
      showArrows={true}
      showStatus={false}
      showIndicators={false}
      infiniteLoop={true}
      autoPlay={true}
      interval={3000}
      showThumbs={false}
      className="h-full w-full"
    >
      {sampleProducts.map((product) => (
        <div key={product.id} className="h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </Carousel>
  </div>

  {/* Horizontally Scrollable Categories */}
  <div className="container mx-auto px-4 py-6">
    <h2 className="text-xl md:text-2xl font-bold text-amber-900 mb-4 text-center">
      Our Categories
    </h2>

    <div className="relative">
      <div className="flex overflow-x-auto pb-4 space-x-6 scroll-smooth hide-scrollbar">
        {sampleProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col items-center flex-shrink-0 w-40"
          >
            <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-amber-300 hover:border-amber-500 transition-all">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
            <p className="mt-3 text-center font-medium text-amber-900">
              {product.category}
            </p>
            <p className="text-sm text-amber-600 mt-1">
              {product.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* People Also Viewed Section */}
  <div className="container mx-auto px-4 py-6">
    <h2 className="text-xl md:text-2xl font-bold text-amber-900 mb-4 text-center">
      People Also Viewed
    </h2>

    <div className="relative">
      <div className="flex overflow-x-auto pb-4 space-x-6 scroll-smooth hide-scrollbar">
        {recommendedProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col items-center flex-shrink-0 w-40 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-amber-300 hover:border-amber-500 transition-all">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
            <p className="mt-3 text-center font-medium text-amber-900">
              {product.name}
            </p>
            <p className="text-sm text-amber-600 mt-1">
              ₹{product.price}
            </p>
            <button
              className="mt-2 bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 transition-colors text-sm"
              onClick={() => handleAdd(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>

  <style >{`
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `}</style>

  {/* Product Grid Section - 2 per row */}
  <div className="container mx-auto px-4 py-8 bg-amber-50">
    <h2 className="text-2xl md:text-3xl font-bold text-amber-900 mb-8 text-center font-serif">
      Our Premium Products
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sampleProducts.map((product) => (
        <Link key={product.id} to={`/product/${product.id}`}>
          <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100">
            {/* Product Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {product.category === "Specialty" && (
                <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-amber-900 truncate">{product.name}</h3>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full ml-2">
                  {product.weight}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-amber-700">₹{product.price}</span>
                <button
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm flex items-center transition-colors"
                  onClick={(e) => {
                    e.preventDefault(); // prevent navigating when clicking Add
                    handleAdd(product);
                  }}
                >
                  <CartIcon className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>

  {/* Footer Section */}
  <footer className="bg-amber-900 text-amber-50 pt-12 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold font-serif mb-4">GharKaAchar</h2>
          <p className="text-amber-200 mb-4">
            Authentic Indian pickles and traditional foods crafted with love and generations-old recipes.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-amber-200 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-amber-200 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-amber-200 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Home</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Shop</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold mb-4">Categories</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Pickles</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Chutneys</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Papads</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Desserts</a></li>
            <li><a href="#" className="text-amber-200 hover:text-white transition-colors">Specialty Items</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-amber-200">+91 98765 43210</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-amber-200">contact@gharkaachar.com</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-amber-200">123 Spice Lane, Mumbai, India 400001</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-amber-700 my-8"></div>

      {/* Copyright */}
      <div className="text-center text-amber-300">
        <p>&copy; {new Date().getFullYear()} GharKaAchar. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-sm text-amber-300 hover:text-white">Privacy Policy</a>
          <a href="#" className="text-sm text-amber-300 hover:text-white">Terms of Service</a>
          <a href="#" className="text-sm text-amber-300 hover:text-white">Shipping Policy</a>
        </div>
      </div>
    </div>
  </footer>
</div>
);
}