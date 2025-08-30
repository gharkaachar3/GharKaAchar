import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">About Us</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ghar Ka Achar</h2>
        <p className="text-gray-700 mb-4">
          Ghar Ka Achar is a small homemade pickle business based in Jharkhand, India. We specialize in traditional Indian pickles
          made with authentic recipes passed down through generations.
        </p>
        <p className="text-gray-700 mb-4">
          Our mission is to bring the authentic taste of homemade pickles to customers across India while maintaining the highest
          quality standards and traditional preparation methods.
        </p>
        <p className="text-gray-700">
          All our products are prepared in a hygienic home kitchen environment using fresh, natural ingredients without any
          artificial preservatives.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p className="text-gray-700">
          Founded in 2020, Ghar Ka Achar started as a small home-based operation. What began as making pickles for family and friends
          soon grew into a small business as more people discovered and loved our authentic homemade taste. We take pride in using
          traditional methods and recipes that have been perfected over generations.
        </p>
      </div>
    </div>
  );
};

export default About;