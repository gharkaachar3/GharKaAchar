import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaShoppingBag, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBoxOpen,
  FaPrint,
  FaDownload,
  FaWhatsapp,
  FaRupeeSign
} from 'react-icons/fa';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { orders: ordersResponse, data: productsData } = useSelector(state => state.getdata);
  const user = useSelector(state => state.auth.user?.user || state.auth.user);
  
  const ordersData = ordersResponse?.data || [];
  const products = productsData?.data || [];
  
  // Find the specific order
  const order = ordersData.find(o => o._id === orderId || o.orderId === orderId);
  
  // WhatsApp contact function
  const contactWhatsApp = () => {
    const phoneNumber = "+917870898589";
    const message = `Hello, I need help with my order #${order?.orderId || orderId}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Request refund function
  const requestRefund = () => {
    const phoneNumber = "+917870898589";
    const message = `Hello, I would like to request a refund for order #${order?.orderId || orderId}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // If order not found
  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBoxOpen className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you are looking for does not exist.</p>
          <Link
            to="/orders"
            className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Enhance order items with product details
  const enhancedItems = order.items.map(item => {
    // Try to find the product by ID or name
    const product = products.find(p => 
      p._id === item.productId || 
      p._id === item.id ||
      p.product_name === item.name
    );
    
    return {
      ...item,
      productDetails: product || null
    };
  });

  const getStatusIcon = (status) => {
    if (!status) return <FaClock className="text-gray-500" />;
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'processing':
        return <FaClock className="text-blue-500" />;
      case 'shipped':
        return <FaTruck className="text-orange-500" />;
      case 'delivered':
        return <FaBoxOpen className="text-green-600" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div className="w-full">
            <Link
              to="/orders"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Orders
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2 break-words">Order Details</h1>
            <p className="text-gray-600 break-words">Order #{order.orderId}</p>
          </div>
          
       
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4 md:p-6 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <FaShoppingBag className="text-amber-600 text-lg md:text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Order Status</h2>
                    <p className="text-gray-600 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 md:px-4 md:py-2 rounded-full font-semibold flex items-center ${getStatusColor(order.orderStatus)} text-sm md:text-base`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="ml-2 capitalize">{order.orderStatus || 'pending'}</span>
                </span>
              </div>

              {/* Order Items */}
              <div className="mb-6 overflow-hidden">
                <h3 className="font-semibold text-gray-800 mb-4">Items ({enhancedItems.length})</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {enhancedItems.map((item, index) => (
                    <div key={index} className="flex items-center border-b border-gray-100 pb-4 last:border-b-0">
                      {item.productDetails?.product_image ? (
                        <img 
                          src={item.productDetails.product_image} 
                          alt={item.name}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover mr-3 md:mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg mr-3 md:mr-4 flex items-center justify-center">
                          <FaShoppingBag className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                        {item.productDetails?.product_description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {item.productDetails.product_description}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-semibold text-gray-800 whitespace-nowrap">
                          <FaRupeeSign className="inline mr-1" />
                          {item.price}
                        </p>
                        <p className="text-sm font-semibold text-amber-600 whitespace-nowrap">
                          <FaRupeeSign className="inline mr-1" />
                          {item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm md:text-base">Subtotal</span>
                  <span className="font-semibold text-black text-sm md:text-base">
                    <FaRupeeSign className="inline mr-1" />
                    {order.subtotal || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm md:text-base">Shipping</span>
                  <span className="font-semibold text-black text-sm md:text-base">
                    <FaRupeeSign className="inline mr-1" />
                    {order.shippingCost || 0}
                  </span>
                </div>
                {order.codCharges > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm md:text-base">COD Charges</span>
                    <span className="font-semibold text-sm md:text-base">
                      <FaRupeeSign className="inline mr-1" />
                      {order.codCharges}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-amber-600">
                    <FaRupeeSign className="inline mr-1" />
                    {order.totalAmount || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-4 md:p-6 overflow-hidden"
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaMapMarkerAlt className="text-amber-600 mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="text-gray-800 font-semibold break-words">{order.userName}</p>
                {order.address && (
                  <>
                    <p className="text-gray-600 break-words">{order.address.flatHouse}</p>
                    <p className="text-gray-600 break-words">{order.address.areaStreet}</p>
                    {order.address.landmark && <p className="text-gray-600 break-words">{order.address.landmark}</p>}
                    <p className="text-gray-600 break-words">
                      {order.address.city}, {order.address.state} - {order.address.pincode}
                    </p>
                  </>
                )}
                <div className="flex items-center mt-3 text-gray-600">
                  <FaPhone className="mr-2 flex-shrink-0" />
                  <span className="break-words">{order.phone}</span>
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-4 md:p-6 overflow-hidden"
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Method:</span>
                  <span className="text-gray-800 capitalize text-sm md:text-base">{order.paymentMethod?.replace('_', ' ') || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Status:</span>
                  <span className={`font-semibold text-sm md:text-base ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-4 md:p-6 overflow-hidden"
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">Our support team is here to help with your order</p>
              <div className="space-y-3">
                <button 
                  onClick={contactWhatsApp}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  Contact Support
                </button>
                <button 
                  onClick={requestRefund}
                  className="w-full border border-green-500 text-green-600 hover:bg-green-50 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm md:text-base"
                >
                  <FaWhatsapp className="mr-2" />
                  Request Refund
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;