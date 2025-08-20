import React from 'react';
import { CartIcon } from './Homes'; // Import from your existing component

const CategoriesPage = () => {
  // Sample categories data
  const categories = [
    {
      id: 1,
      name: "Mango Pickles",
      image: "https://www.jhajistore.com/cdn/shop/files/6_0db5b18c-a729-4a12-8f33-414be086ce24_500x.jpg?v=1703232511",
      productCount: 12
    },
    {
      id: 2,
      name: "Mixed Pickles",
      image: "https://www.jhajistore.com/cdn/shop/files/Mixed_Pickles_500x.jpg?v=1703229599",
      productCount: 8
    },
    {
      id: 3,
      name: "Spicy Pickles",
      image: "https://www.jhajistore.com/cdn/shop/files/Spicy_Pickles_6c9a4ad3-a0a9-4f42-a8de-02bbb88a9297_500x.jpg?v=1703230259",
      productCount: 15
    },
    {
      id: 4,
      name: "Chutneys",
      image: "https://www.jhajistore.com/cdn/shop/files/mango-chutney.jpg",
      productCount: 10
    },
    {
      id: 5,
      name: "Papads",
      image: "https://www.jhajistore.com/cdn/shop/files/masala-papad.jpg",
      productCount: 6
    },
    {
      id: 6,
      name: "Desserts",
      image: "https://www.jhajistore.com/cdn/shop/files/Sweet_Category_Feature_Image_500x.jpg?v=1726681863",
      productCount: 7
    },
    {
      id: 7,
      name: "Specialty Items",
      image: "https://www.jhajistore.com/cdn/shop/files/Bihari_Pickles_67611979-c95d-4074-a2c1-0c11c4cb3378_500x.jpg?v=1703232512",
      productCount: 5
    },
    {
      id: 8,
      name: "Gift Packs",
      image: "https://www.jhajistore.com/cdn/shop/files/gift-pack.jpg",
      productCount: 4
    }
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header would be imported from your existing component */}
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-amber-700 mb-6">
          <a href="#" className="hover:text-amber-900">Home</a> / <span className="text-amber-900">Categories</span>
        </div>
        
        {/* Page Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-amber-900 font-serif mb-8 text-center">
          Our Categories
        </h1>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-amber-100"
            >
              <a href={`/category/${category.id}`} className="block">
                {/* Category Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Category Info */}
                <div className="p-4">
                  <h3 className="font-bold text-amber-900 text-center">{category.name}</h3>
                  <p className="text-xs text-amber-600 text-center mt-1">
                    {category.productCount} products
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer would be imported from your existing component */}
    </div>
  );
};

export default CategoriesPage;