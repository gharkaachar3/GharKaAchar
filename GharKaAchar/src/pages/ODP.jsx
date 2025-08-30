import { useSelector, useDispatch } from "react-redux";
import { getAllOrder } from "../redux/getdata";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaShoppingBag, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaBox, 
  FaArrowRight,
  FaRupeeSign
} from "react-icons/fa";

export default function OrdersPage() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getAllOrder());
  }, [dispatch]);
  
  const { 
    loading: ordersLoading, 
    error: ordersError, 
    orders: ordersResponse
  } = useSelector(state => state.getdata);
  
  const user = useSelector(state => state.auth.user?.user || state.auth.user);
  
  // Properly destructure orders data
  const ordersData = ordersResponse?.data || [];
  const userOrders = ordersData.filter(data => data.userId === user?._id || data.userId === user?.id);
  
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
        return <FaBox className="text-green-600" />;
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
      year: 'numeric'
    });
  };

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-amber-800">Loading your orders...</h2>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClock className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error loading orders</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage your order history</p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
          {userOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingBag className="text-amber-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
              <Link
                to="/"
                className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            userOrders.map((order, index) => (
              <motion.div
                key={order._id || order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <Link to={`/orders/${order.orderId || order.id}`} className="block">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center mt-2 sm:mt-0 ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-2 capitalize">{order.orderStatus || 'pending'}</span>
                      </span>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-amber-600">
                          <FaRupeeSign className="inline mr-1" />
                          {order.totalAmount || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                        </p>
                      </div>
                      <div className="flex items-center text-amber-600">
                        <span className="text-sm font-semibold mr-2">View Details</span>
                        <FaArrowRight className="text-sm" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Statistics */}
        {userOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 mt-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{userOrders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {userOrders.filter(o => o.orderStatus === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userOrders.filter(o => ['processing', 'shipped'].includes(o.orderStatus)).length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {userOrders.filter(o => o.paymentMethod === 'cod').length}
                </div>
                <div className="text-sm text-gray-600">COD Orders</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}