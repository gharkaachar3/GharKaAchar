import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GetAllbanners } from "../redux/getdata";
import { useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router"; // Add this import

export default function DeleteBanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add navigate hook
  const [deleting, setDeleting] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    dispatch(GetAllbanners());
  }, [dispatch]);

  const { data } = useSelector(state => state.getdata.banners); // Add loading here
  const { error , loading } = useSelector(state => state.getdata);

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteConfirm = (banner) => {
    setShowConfirmModal(banner);
  };

  const handleDelete = async (bannerId, publicId, category) => {
    setDeleting(bannerId);
    setShowConfirmModal(null);
    
    try {
      const deleteres = await axiosClient.delete(`/admin/delete/banner/${bannerId}`);
      
      if (deleteres.status === 200) {
        showNotification(`Banner "${category}" deleted successfully!`, 'success');
        dispatch(GetAllbanners());
      }
      
    } catch (error) {
      console.error('Error deleting banner:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete banner. Please try again.', 
        'error'
      );
    } finally {
      setDeleting(null);
    }
  };

  // Loading state
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <div className="text-amber-800 text-lg">Loading banners...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-white p-8 text-center max-w-md">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">Error loading banners</p>
          <button
            onClick={() => dispatch(GetAllbanners())}
            className="inline-flex items-center justify-center rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 relative">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg p-4 shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-800' 
            : 'bg-red-100 border border-red-400 text-red-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto pl-3"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              Banner Management
            </h1>
            <p className="text-amber-700">Delete and manage your banners</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2V2z" />
              </svg>
              {data.length} Banner{data.length !== 1 ? 's' : ''}
            </span>
            
            <button
              onClick={() => dispatch(GetAllbanners())}
              className="inline-flex items-center justify-center rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {data.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-amber-200 bg-white p-12 text-center">
            <div className="text-amber-300 mb-6">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
            <p className="text-gray-500 mb-6">Get started by adding some banners to your collection</p>
            <button 
              className="inline-flex items-center justify-center rounded-md bg-amber-600 text-white px-6 py-3 text-sm font-medium hover:bg-amber-700 transition-colors duration-200" 
              onClick={() => navigate('/admin/banners/add')} // Fixed navigation
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Banner
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((banner, index) => (
              <div
                key={banner._id}
                className="group rounded-xl border border-amber-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Banner Image */}
                <div className="relative">
                  <img
                    src={banner.banner_image}
                    alt={`${banner.banner_category} banner`}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'><rect width='100%' height='100%' fill='%23FFE8B3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%238B5E00'>Image Not Found</text></svg>";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Banner Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center">
                      <svg className="mr-2 h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {banner.banner_category}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <span className="text-xs font-medium text-gray-500 min-w-16">ID:</span>
                      <span className="text-xs text-gray-600 break-all font-mono">{banner.banner_publicId}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-gray-500 min-w-16">Added:</span>
                      <span className="text-xs text-gray-600">
                        {new Date(banner.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteConfirm(banner)}
                    disabled={deleting === banner._id}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 text-sm font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {deleting === banner._id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Banner
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.66 0L4.154 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete the <span className="font-semibold text-gray-900 capitalize">"{showConfirmModal.banner_category}"</span> banner?
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <img
                  src={showConfirmModal.banner_image}
                  alt="Banner preview"
                  className="h-20 w-full object-cover rounded border"
                />
              </div>
              <p className="text-red-600 text-sm mt-2 font-medium">This action cannot be undone.</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirmModal._id, showConfirmModal.banner_publicId, showConfirmModal.banner_category)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
