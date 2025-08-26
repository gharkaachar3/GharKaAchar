import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/AuthSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const image1 = new URL("../assets/download.jpeg", import.meta.url).href;

// Enhanced Icons (same as before)
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Enhanced Toast Component
const Toast = ({ message, type = 'success', onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border ${
        type === 'success' 
          ? 'bg-white border-green-200 text-green-800' 
          : 'bg-white border-red-200 text-red-800'
      } min-w-[300px]`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {type === 'success' ? '✓' : '✕'}
        </div>
        <span className="flex-1 font-medium">{message}</span>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

export default function Profile() {
  // ✅ FIXED: Correct Redux state destructuring
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ✅ Debug logs (remove in production)
  console.log('Auth State:', { user, isAuthenticated });
  console.log('User Details:', user);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      showToast('Logged out successfully!', 'success');
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error logging out', 'error');
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const goHome = () => navigate("/");

  // ✅ Check both authentication and user existence
  if (!isAuthenticated || !user) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white p-8 rounded-2xl shadow-xl text-center border border-amber-100 max-w-md w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Not Logged In</h2>
          <p className="text-gray-600 mb-8">Please log in to access your profile.</p>
          <motion.div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Go to Login
            </Link>
            <button
              onClick={goHome}
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all"
            >
              Return Home
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // ✅ Better role checking - handle multiple possible user data structures
  const isAdmin = String(user?.role || user?.user?.role || "").toLowerCase() === "admin";

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <motion.div 
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={goHome}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 bg-white hover:bg-amber-50 px-4 py-2 rounded-xl shadow-md transition-all mr-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BackIcon />
            <span className="font-medium">Back to Home</span>
          </motion.button>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ✅ Profile Card with Better Data Handling */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-center text-white relative">
                <div className="absolute top-4 right-4">
                  {isAdmin && (
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                
                <motion.div 
                  className="relative mx-auto mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={user?.profileImage || user?.user?.profileImage || image1}
                    alt="User Avatar"
                    className="w-28 h-28 rounded-full border-4 border-white/50 object-cover mx-auto shadow-lg"
                  />
                  <button className="absolute bottom-2 right-2 bg-white text-amber-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all">
                    <EditIcon />
                  </button>
                </motion.div>
                
                {/* ✅ Handle different user data structures */}
                <h2 className="text-2xl font-bold mb-2">
                  {user?.name || user?.user?.name || user?.firstName || "User"}
                </h2>
                <p className="text-amber-100 text-sm">
                  {user?.email || user?.user?.email || "No email provided"}
                </p>
                
                {/* Phone number if available */}
                {(user?.phone || user?.user?.phone || user?.number) && (
                  <p className="text-amber-100 text-xs mt-1">
                    📱 {user?.phone || user?.user?.phone || user?.number}
                  </p>
                )}
              </div>

              {/* ✅ User Details */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Status</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {user?.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Phone Verified</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user?.isPhoneVerified || user?.user?.isPhoneVerified
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user?.isPhoneVerified || user?.user?.isPhoneVerified ? '✓ Verified' : '⚠ Not Verified'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Role</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isAdmin 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                  
                  {/* User ID for debugging (remove in production) */}
                  {user?.id && (
                    <div className="flex justify-between items-center py-3 text-xs text-gray-400">
                      <span>User ID</span>
                      <span>#{user.id}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ✅ Actions Panel - Same as before */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-8">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Panel */}
                {isAdmin && (
                  <motion.button
                    onClick={() => navigate("/admin")}
                    className="group p-6 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl transition-all shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                        <AdminIcon />
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-bold">Admin Panel</h4>
                        <p className="text-emerald-100 text-sm">Manage products & users</p>
                      </div>
                    </div>
                  </motion.button>
                )}

                {/* My Orders */}
                <motion.button
                  onClick={() => navigate("/orders")}
                  className="group p-6 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                      <OrdersIcon />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-bold">My Orders</h4>
                      <p className="text-amber-100 text-sm">Track your purchases</p>
                    </div>
                  </div>
                </motion.button>

                {/* Reset Password */}
                <motion.button
                  onClick={() => navigate("/reset-password")}
                  className="group p-6 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                      <KeyIcon />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-bold">Reset Password</h4>
                      <p className="text-blue-100 text-sm">Update your password</p>
                    </div>
                  </div>
                </motion.button>

                {/* Delete Account */}
                <motion.button
                  onClick={() => navigate("/delete-account")}
                  className="group p-6 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                      <TrashIcon />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-bold">Delete Account</h4>
                      <p className="text-red-100 text-sm">Permanently remove account</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Logout Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <motion.button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogoutIcon />
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✅ Logout Confirmation Modal - Same as before */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogoutIcon className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sign Out?</h3>
                <p className="text-gray-600 mb-8">
                  Are you sure you want to sign out of your account?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
