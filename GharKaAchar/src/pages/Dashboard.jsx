import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { Toaster, toast } from "sonner";
import { GetAlladmins } from "../redux/getdata";

// Enhanced Modern Icons with better visibility
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

const Dashboard = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({
    activeOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { admins, loading: adminsLoading, error: adminsError } = useSelector(state => state.getdata);
  
  // Get user count from admins data with better error handling
  const userCount = admins?.data?.length || 0;

  // Fetch dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch all orders with error handling
      const ordersResponse = await axiosClient.get("/orders/all");
      
      // Better data validation
      if (!ordersResponse.data || !Array.isArray(ordersResponse.data.data)) {
        throw new Error("Invalid orders data format");
      }
      
      const ordersData = ordersResponse.data.data;
      
      // Calculate stats with validation
      const activeOrdersCount = ordersData.filter(
        order => order && order.status && ["pending", "processing", "shipped"].includes(order.status.toLowerCase())
      ).length;

      setStats({
        activeOrders: activeOrdersCount,
      });
      
      setOrders(ordersData.slice(0, 10)); // Show only recent 10 orders
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error(error.message || "Failed to fetch dashboard data", {
        duration: 4000,
        position: "top-center"
      });
      
      // Set fallback data on error
      setStats({ activeOrders: 0 });
      setOrders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load admins data on component mount
  useEffect(() => {
    if (!adminsLoading && !admins?.data) {
      dispatch(GetAlladmins());
    }
  }, [dispatch, admins, adminsLoading]);

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border border-gray-300";
    
    const normalizedStatus = status.toLowerCase();
    const styles = {
      pending: "bg-amber-100 text-amber-800 border border-amber-300",
      processing: "bg-blue-100 text-blue-800 border border-blue-300",
      shipped: "bg-purple-100 text-purple-800 border border-purple-300",
      delivered: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      cancelled: "bg-red-100 text-red-800 border border-red-300",
      failed: "bg-gray-100 text-gray-800 border border-gray-300",
    };
    return styles[normalizedStatus] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  const getPaymentBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border border-gray-300";
    
    const normalizedStatus = status.toLowerCase();
    const styles = {
      pending: "bg-amber-100 text-amber-800 border border-amber-300",
      paid: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      failed: "bg-red-100 text-red-800 border border-red-300",
      initiated: "bg-blue-100 text-blue-800 border border-blue-300",
    };
    return styles[normalizedStatus] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Toaster richColors position="top-center" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Overview
            </h1>
            <p className="text-slate-600 mt-1">Monitor your business performance</p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshIcon className={isRefreshing ? "animate-spin" : ""} />
            <span className="text-sm font-medium text-slate-700">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>

        {/* Error handling for admins */}
        {adminsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm">Failed to load user data. Please refresh the page.</p>
          </div>
        )}

        {/* Stats Grid - Now only 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Users */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <UsersIcon />
                </div>
                {adminsLoading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-blue-600"></div>
                )}
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{userCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <OrdersIcon />
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Active Orders</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeOrders}</p>
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
          
          {orders.length === 0 ? (
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{order.orderNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{order.user_email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">₹{(order.totalAmount || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status || 'unknown'}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
