import React from 'react';

const Privacy = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: January 1, 2023</p>
          
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect personal information that you provide to us, including:
          </p>
          <ul className="list-disc pl-5 text-gray-700 mb-6">
            <li>Name and contact information (email address, phone number)</li>
            <li>Shipping and billing address</li>
            <li>Payment information (processed securely by our payment partners)</li>
            <li>Order history and preferences</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use your personal information for the following purposes:
          </p>
          <ul className="list-disc pl-5 text-gray-700 mb-6">
            <li>To process and fulfill your orders</li>
            <li>To communicate with you about your orders and inquiries</li>
            <li>To improve our products and services</li>
            <li>To send promotional communications (with your consent)</li>
            <li>To comply with legal obligations</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
          <p className="text-gray-700 mb-6">
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure. 
            All payment transactions are encrypted using SSL technology.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">4. Data Retention</h2>
          <p className="text-gray-700 mb-6">
            We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, 
            comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-5 text-gray-700 mb-6">
            <li>Access and review your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">6. Third-Party Services</h2>
          <p className="text-gray-700 mb-6">
            We may use third-party service providers to process payments, deliver products, and analyze website usage. 
            These providers have access to your personal information only to perform these tasks on our behalf.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
          <p className="text-gray-700 mb-6">
            Our website uses cookies to enhance your browsing experience and analyze website traffic. 
            You can control cookies through your browser settings.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">8. Changes to Privacy Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on our website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;