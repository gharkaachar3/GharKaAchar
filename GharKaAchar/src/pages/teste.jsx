import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';


// SVG Icons
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

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TrackOrderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const Home = () => {
 

  // Dummy data
  const categories = [
    { id: 1, name: 'Tribal Jewelry', image: '/images/jewelry.jpg' },
    { id: 2, name: 'Sohrai Art', image: '/images/sohrai.jpg' },
    { id: 3, name: 'Bamboo Crafts', image: '/images/bamboo.jpg' },
    { id: 4, name: 'Tussar Silk', image: '/images/silk.jpg' },
    { id: 5, name: 'Wood Carvings', image: '/images/wood.jpg' },
  ];

  const products = [
    { id: 1, name: 'Tribal Necklace Set', price: '₹1,499', image: '/images/product1.jpg', rating: 4 },
    { id: 2, name: 'Handmade Sohrai Painting', price: '₹2,999', image: '/images/product2.jpg', rating: 5 },
    { id: 3, name: 'Bamboo Basket Set', price: '₹799', image: '/images/product3.jpg', rating: 4 },
    { id: 4, name: 'Tussar Silk Scarf', price: '₹1,299', image: '/images/product4.jpg', rating: 3 },
    { id: 5, name: 'Wooden Tribal Mask', price: '₹1,899', image: '/images/product5.jpg', rating: 5 },
    { id: 6, name: 'Traditional Pottery Set', price: '₹1,099', image: '/images/product6.jpg', rating: 4 },
  ];

  const carouselItems = [
    { id: 1, image: '/images/banner1.jpg', alt: 'Jharkhand Tribal Art' },
    { id: 2, image: '/images/banner2.jpg', alt: 'Handicrafts Collection' },
    { id: 3, image: '/images/banner3.jpg', alt: 'Traditional Jewelry' },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-amber-800 text-amber-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            className="p-2 rounded-md hover:bg-amber-700 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon />
          </button>
          
          <h1 className="text-xl font-bold font-serif">Jharkhand Tribal Crafts</h1>
          
          <div className="flex items-center space-x-4">
            <button className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-amber-700 transition-colors">
              <TrackOrderIcon />
              <span className="text-sm">Track Order</span>
            </button>
            <button className="p-2 rounded-md hover:bg-amber-700 transition-colors">
              <UserIcon />
            </button>
            <button className="p-2 rounded-md hover:bg-amber-700 transition-colors relative">
              <CartIcon />
              <span className="absolute -top-1 -right-1 bg-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-amber-700 text-amber-50 shadow-lg">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
            <a href="#" className="py-2 px-4 hover:bg-amber-600 rounded-md">Home</a>
            <a href="#" className="py-2 px-4 hover:bg-amber-600 rounded-md">Shop</a>
            <a href="#" className="py-2 px-4 hover:bg-amber-600 rounded-md">Collections</a>
            <a href="#" className="py-2 px-4 hover:bg-amber-600 rounded-md">About Us</a>
            <a href="#" className="py-2 px-4 hover:bg-amber-600 rounded-md flex items-center space-x-2">
              <TrackOrderIcon />
              <span>Track Order</span>
            </a>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Carousel Banner */}
        <section className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <Carousel
            autoPlay
            infiniteLoop
            interval={5000}
            showThumbs={true}
            showStatus={false}
            showArrows={false}
            thumbWidth={80}
            className="rounded-xl"
          >
            {carouselItems.map((item) => (
              <div key={item.id}>
                <img 
                  src={item.image} 
                  alt={item.alt}
                  className="w-full h-64 sm:h-96 object-cover"
                />
              </div>
            ))}
          </Carousel>
        </section>

        {/* Categories */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Shop by Category</h2>
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex-shrink-0 w-40 sm:w-48 relative rounded-2xl overflow-hidden shadow-md"
                >
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 to-transparent flex items-end p-4">
                    <h3 className="text-amber-50 font-medium">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Featured Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="card bg-amber-100 border border-amber-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <figure className="relative pt-[100%]">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body p-4">
                  <h3 className="card-title text-sm font-medium text-amber-900">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-amber-800">{product.price}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${i < product.rating ? 'text-amber-500' : 'text-amber-300'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="card-actions mt-4">
                    <button className="btn btn-sm btn-block bg-amber-700 text-amber-50 hover:bg-amber-800 border-none">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cultural Section */}
        <section className="mb-12 bg-amber-800 text-amber-50 rounded-xl overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">The Spirit of Jharkhand</h2>
              <p className="mb-4">
                Jharkhand's tribal heritage is a vibrant tapestry of art, culture, and tradition. 
                Our crafts reflect the deep connection between the tribal communities and nature.
              </p>
              <p className="mb-6">
                Each piece in our collection tells a story - from the intricate Sohrai paintings 
                depicting harvest festivals to the bamboo crafts that showcase sustainable living.
              </p>
              <button className="btn btn-outline border-amber-50 text-amber-50 hover:bg-amber-50 hover:text-amber-800 self-start">
                Explore Our Story
              </button>
            </div>
            <div className="md:w-1/2 flex">
              <div className="w-1/2 border-r border-amber-700">
                <img 
                  src="/images/culture1.jpg" 
                  alt="Tribal Dance" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-1/2">
                <img 
                  src="/images/culture2.jpg" 
                  alt="Traditional Art" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-amber-200">All Products</a></li>
                <li><a href="#" className="hover:text-amber-200">New Arrivals</a></li>
                <li><a href="#" className="hover:text-amber-200">Featured</a></li>
                <li><a href="#" className="hover:text-amber-200">Collections</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-amber-200">Our Story</a></li>
                <li><a href="#" className="hover:text-amber-200">Artisans</a></li>
                <li><a href="#" className="hover:text-amber-200">Sustainability</a></li>
                <li><a href="#" className="hover:text-amber-200">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Help</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-amber-200">FAQs</a></li>
                <li><a href="#" className="hover:text-amber-200">Shipping</a></li>
                <li><a href="#" className="hover:text-amber-200">Returns</a></li>
                <li><a href="#" className="hover:text-amber-200">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Newsletter</h3>
              <p className="mb-4 text-sm">Subscribe for updates on new products and tribal stories</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 w-full rounded-l-md text-amber-900 focus:outline-none"
                />
                <button className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-r-md">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-amber-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2023 Jharkhand Tribal Crafts. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a href="#" className="hover:text-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="hover:text-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// export default Home;