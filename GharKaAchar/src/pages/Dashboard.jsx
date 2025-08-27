import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toaster, toast } from "sonner";
import { GetAlladmins, getAllOrder } from "../redux/getdata";
import { motion, AnimatePresence } from "framer-motion";

// Icons (keeping them same as before)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m22 21-3-3m0 0a2 2 0 1 1-3-3 2 2 0 0 1 3 3Z" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10v4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10v4" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // ✅ Get data from Redux store
  const { 
    admins, 
    loading: adminsLoading, 
    error: adminsError, 
    orders: ordersResponse,
    loading: ordersLoading,
    data: productsData
  } = useSelector(state => state.getdata);
  
  console.log('Orders from Redux:', ordersResponse);
  console.log('Products data from Redux:', productsData);
  
  // Properly destructure orders data
  const ordersData = ordersResponse?.data || [];
  const userCount = admins?.data?.length || 0;

  // ✅ FIXED: Enhanced function to match products with correct field names
  const enrichOrderItems = (order, products) => {
    console.log('Enriching order:', order);
    console.log('Available products:', products);
    
    if (!order.items || !products || products.length === 0) {
      console.log('Missing order items or products');
      return order;
    }

    const enrichedItems = order.items.map((item, index) => {
      console.log(`Processing item ${index}:`, item);
      
      // ✅ Try multiple ways to match product with CORRECT field names
      let product = null;
      
      // Method 1: Match by _id
      if (item.productId) {
        product = products.find(p => p._id === item.productId || p.id === item.productId);
      }
      
      // Method 2: Match by product name (using product_name field)
      if (!product && item.name) {
        product = products.find(p => 
          p.product_name?.toLowerCase().includes(item.name.toLowerCase()) ||
          p.name?.toLowerCase().includes(item.name.toLowerCase())
        );
      }
      
      // Method 3: Match by exact name
      if (!product && item.name) {
        product = products.find(p => 
          p.product_name === item.name || 
          p.name === item.name
        );
      }
      
      console.log(`Found product for item ${index}:`, product);
      
      if (product) {
        return {
          ...item,
          productId: item.productId || product._id,
          // ✅ Use correct field names from your product data
          name: product.product_name || product.name || item.name || 'Product Name',
          price: item.price || product.product_price || product.price || 0,
          image: product.product_image || product.image || item.image || null,
          description: product.product_description || product.description || item.description || '',
          category: product.product_category || product.category || '',
          quantity: item.quantity || 1
        };
      }
      
      // ✅ Return item with original data if no product match
      return {
        productId: item.productId || 'unknown',
        name: item.name || item.productName || 'Product not found',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || null,
        description: item.description || ''
      };
    });

    console.log('Final enriched items:', enrichedItems);

    return {
      ...order,
      items: enrichedItems
    };
  };

  // Calculate stats from orders data
  const calculateStats = (orders) => {
    if (!orders || orders.length === 0) {
      return { activeOrders: 0, totalOrders: 0, totalRevenue: 0 };
    }

    const activeOrdersCount = orders.filter(
      order => order && order.orderStatus && 
      ["created", "confirmed", "processing", "shipped"].includes(order.orderStatus.toLowerCase())
    ).length;

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount) || 0);
    }, 0);

    return {
      activeOrders: activeOrdersCount,
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
    };
  };

  // Update stats when orders data changes
  useEffect(() => {
    if (ordersData && ordersData.length > 0) {
      const newStats = calculateStats(ordersData);
      setStats(newStats);
    }
  }, [ordersData]);

  // Load data on component mount
  useEffect(() => {
    if (!adminsLoading && !admins?.data) {
      dispatch(GetAlladmins());
    }
    
    if (!ordersLoading && (!ordersData || ordersData.length === 0)) {
      dispatch(getAllOrder());
    }
  }, [dispatch, admins, adminsLoading, ordersData, ordersLoading]);

  // Refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    dispatch(GetAlladmins());
    dispatch(getAllOrder());
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dashboard data refreshed!');
    }, 2000);
  };

  // ✅ FIXED: View order details function
  const viewOrderDetails = (order) => {
    console.log('Viewing order details for:', order);
    
    // Enrich order with product details using correct field names
    const enrichedOrder = enrichOrderItems(order, productsData?.data || []);
    console.log('Enriched order:', enrichedOrder);
    
    setSelectedOrder(enrichedOrder);
    setShowOrderModal(true);
  };

  // Status badges
  const getStatusBadge = (orderStatus) => {
    if (!orderStatus) return "bg-gray-100 text-gray-800 border border-gray-300";
    
    const normalizedStatus = orderStatus.toLowerCase();
    const styles = {
      created: "bg-blue-100 text-blue-800 border border-blue-300",
      confirmed: "bg-green-100 text-green-800 border border-green-300",
      processing: "bg-amber-100 text-amber-800 border border-amber-300",
      shipped: "bg-purple-100 text-purple-800 border border-purple-300",
      delivered: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      cancelled: "bg-red-100 text-red-800 border border-red-300",
      returned: "bg-gray-100 text-gray-800 border border-gray-300",
    };
    return styles[normalizedStatus] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  const getPaymentBadge = (paymentStatus) => {
    if (!paymentStatus) return "bg-gray-100 text-gray-800 border border-gray-300";
    
    const normalizedStatus = paymentStatus.toLowerCase();
    const styles = {
      pending: "bg-amber-100 text-amber-800 border border-amber-300",
      paid: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      failed: "bg-red-100 text-red-800 border border-red-300",
      cod: "bg-orange-100 text-orange-800 border border-orange-300",
    };
    return styles[normalizedStatus] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  // Loading state
  if (adminsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get recent orders
  const recentOrders = ordersData && ordersData.length > 0
    ? [...ordersData]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 10)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Toaster richColors position="top-center" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Monitor your business performance and orders</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshIcon className={isRefreshing ? "animate-spin" : ""} />
            <span className="text-sm font-medium text-slate-700">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>

        {/* Error handling */}
        {adminsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm">Failed to load user data. Please refresh the page.</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <UsersIcon />
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{userCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <OrdersIcon />
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
            <p className="text-sm text-slate-600 mt-1">Latest customer orders and their status</p>
          </div>
          
          {!ordersData || ordersData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <OrdersIcon />
              </div>
              <p className="text-slate-500 text-lg font-medium">No orders found</p>
              <p className="text-slate-400 text-sm mt-1">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 text-sm">{order.orderId || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{order.userName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{order.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">₹{(order.totalAmount || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(order.paymentStatus)}`}>
                          {order.paymentStatus || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                        >
                          <EyeIcon />
                          <span className="ml-1">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ✅ FIXED: Order Details Modal with Better Image Handling */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <p className="text-indigo-100 mt-1">Order ID: {selectedOrder.orderId}</p>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Customer Information */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-slate-600">Name:</span>
                          <p className="text-slate-900">{selectedOrder.userName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-600">Phone:</span>
                          <p className="text-slate-900">{selectedOrder.phone}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-600">Address:</span>
                          <p className="text-slate-900">{selectedOrder.address?.fullAddress || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* ✅ FIXED: Order Items with Proper Image Display */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Order Items ({selectedOrder.items?.length || 0} items)
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.length > 0 ? selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center p-4 bg-white rounded-xl border">
                            {/* ✅ Enhanced Image Display */}
                            <div className="relative mr-4 flex-shrink-0">
                              {item.image ? (
                                <img 
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                  onLoad={() => console.log('Image loaded successfully:', item.image)}
                                  onError={(e) => {
                                    console.error('Image failed to load:', item.image);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              
                              {/* ✅ Fallback placeholder */}
                              <div 
                                className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200"
                                style={{ display: item.image ? 'none' : 'flex' }}
                              >
                                <div className="text-center">
                                  <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs">No Image</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                              <p className="text-sm text-slate-600">
                                Qty: {item.quantity} × ₹{item.price}
                              </p>
                              {item.category && (
                                <p className="text-xs text-slate-500 mt-1">Category: {item.category}</p>
                              )}
                              {item.productId && item.productId !== 'unknown' && (
                                <p className="text-xs text-slate-400">ID: {item.productId}</p>
                              )}
                              {item.description && (
                                <p className="text-xs text-slate-500 mt-1 truncate">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="font-bold text-slate-900 text-lg">
                                ₹{(item.quantity * item.price).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )) : (
                          <p className="text-slate-500 text-center py-8">No items found in this order</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Status & Payment */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Status</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600">Status:</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600">Payment:</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPaymentBadge(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600">Payment Method:</span>
                          <span className="text-slate-900 uppercase">{selectedOrder.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="text-slate-900">₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Shipping:</span>
                          <span className="text-slate-900">₹{(selectedOrder.shippingCost || 0).toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between text-lg font-semibold">
                            <span className="text-slate-900">Total:</span>
                            <span className="text-indigo-600">₹{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(selectedOrder.orderNotes || selectedOrder.specialInstructions) && (
                      <div className="bg-slate-50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
                        {selectedOrder.orderNotes && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-slate-600">Order Notes:</span>
                            <p className="text-slate-900">{selectedOrder.orderNotes}</p>
                          </div>
                        )}
                        {selectedOrder.specialInstructions && (
                          <div>
                            <span className="text-sm font-medium text-slate-600">Special Instructions:</span>
                            <p className="text-slate-900">{selectedOrder.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Debug Section - Remove in production */}
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Debug Info:</h4>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>Items Count: {selectedOrder.items?.length || 0}</p>
                        <p>Products Available: {productsData?.data?.length || 0}</p>
                        <p>Order ID: {selectedOrder._id}</p>
                        {selectedOrder.items?.[0] && (
                          <div className="mt-2">
                            <p>First Item Image: {selectedOrder.items[0].image || 'No image'}</p>
                            <p>First Item Name: {selectedOrder.items[0].name || 'No name'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
