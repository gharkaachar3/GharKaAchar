import React from 'react';

const Refund = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Refund and Return Policy</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: January 1, 2023</p>
          
          <h2 className="text-xl font-semibold mb-4">1. Returns</h2>
          <p className="text-gray-700 mb-6">
            Due to the perishable nature of our products, we generally do not accept returns unless the product is damaged, defective, or incorrect. 
            If you receive a damaged, defective, or incorrect product, please contact us within 7 days of delivery.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">2. Refunds</h2>
          <p className="text-gray-700 mb-4">
            We offer refunds under the following circumstances:
          </p>
          <ul className="list-disc pl-5 text-gray-700 mb-6">
            <li>Product received is damaged or defective</li>
            <li>Incorrect product was delivered</li>
            <li>Order was canceled before shipment</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">3. Refund Process</h2>
          <p className="text-gray-700 mb-4">
            To request a refund, please contact us at +91 9876543210 or email refunds@gharkaachar.com with:
          </p>
          <ul className="list-disc pl-5 text-gray-700 mb-6">
            <li>Your order number</li>
            <li>Product name and quantity</li>
            <li>Reason for refund request</li>
            <li>Photos of the damaged or incorrect product (if applicable)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">4. Refund Timeframe</h2>
          <p className="text-gray-700 mb-6">
            Once your refund request is approved, we will process the refund within 7-10 business days. 
            The refund will be credited to your original payment method.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">5. Non-Refundable Items</h2>
          <p className="text-gray-700 mb-6">
            The following items are not eligible for refunds:
          </p>
          <ul className="list-disc pl-5 text-gray-700 mb-6">
            <li>Products that have been opened or partially consumed</li>
            <li>Products that are not damaged, defective, or incorrect</li>
            <li>Shipping charges</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">6. Cancellations</h2>
          <p className="text-gray-700">
            You may cancel your order before it has been shipped. Once shipped, orders cannot be canceled. 
            To cancel an order, please contact us as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Refund;