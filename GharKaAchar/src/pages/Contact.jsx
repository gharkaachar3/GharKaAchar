import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
          
          <div className="mb-4 flex items-start">
            <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-gray-700">123 Pickle Street, Ranchi, Jharkhand, India - 834001</p>
            </div>
          </div>
          
          <div className="mb-4 flex items-start">
            <FaPhone className="text-orange-500 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-gray-700">+91 9876543210</p>
              <p className="text-gray-700">+91 9123456789</p>
            </div>
          </div>
          
          <div className="mb-4 flex items-start">
            <FaEnvelope className="text-orange-500 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-gray-700">contact@gharkaachar.com</p>
              <p className="text-gray-700">orders@gharkaachar.com</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
          <div className="mb-2 flex justify-between">
            <span className="font-medium">Monday - Friday:</span>
            <span className="text-gray-700">9:00 AM - 6:00 PM</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="font-medium">Saturday:</span>
            <span className="text-gray-700">10:00 AM - 4:00 PM</span>
          </div>
          <div className="mb-4 flex justify-between">
            <span className="font-medium">Sunday:</span>
            <span className="text-gray-700">Closed</span>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">For order inquiries:</h3>
            <p className="text-gray-700">orders@gharkaachar.com</p>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">For refund requests:</h3>
            <p className="text-gray-700">refunds@gharkaachar.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;