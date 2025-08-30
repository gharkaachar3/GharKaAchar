import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axiosClient from "../utils/axiosClient";

const Checkout = ({ cartItems, onOrderSuccess }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      userName: '',
      phone: '',
      address: {
        flatHouse: '',
        areaStreet: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
      },
      paymentMethod: 'cashfree',
      orderNotes: '',
      specialInstructions: '',
      deliveryPreferences: {
        preferredTimeSlot: 'any',
        leaveAtDoor: false,
        callBeforeDelivery: true
      }
    }
  });

  const [phoneVerification, setPhoneVerification] = useState({
    isVerified: false,
    verificationId: '',
    otp: '',
    isOtpSent: false,
    isVerifying: false
  });

  const [loading, setLoading] = useState({
    sendingOtp: false,
    verifyingOtp: false,
    creatingOrder: false
  });

  const [showOtpModal, setShowOtpModal] = useState(false);

  const phoneValue = watch('phone');
  const paymentMethod = watch('paymentMethod');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const deliveryCharges = 80;
  const totalAmount = subtotal + deliveryCharges;

  useEffect(() => {
    if (phoneValue && phoneValue.length === 10) {
      checkPhoneVerification();
    }
  }, [phoneValue]);

  // ✅ FIXED: Transform cart items to include productId
  const transformCartItems = (items) => {
    console.log('Original cart items:', items);
    
    const transformedItems = items.map(item => {
      const transformedItem = {
        productId: item._id || item.id || item.productId, // Map to productId
        name: item.name || item.product_name || 'Unknown Product',
        image: item.image || item.product_image || '',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || parseFloat(item.product_price) || 0,
        weight: item.weight || item.product_quantity || '',
      };
      
      // Validation: Ensure productId exists
      if (!transformedItem.productId) {
        console.error('Missing productId for item:', item);
        throw new Error('Cart item missing product ID');
      }
      
      return transformedItem;
    });
    
    console.log('Transformed items:', transformedItems);
    return transformedItems;
  };

  // Check if phone is already verified - USING AXIOS CLIENT
  const checkPhoneVerification = async () => {
    try {
      const response = await axiosClient.post('/otp/check-phone', {
        phoneNumber: phoneValue
      });

      if (response.data.success && response.data.isVerified) {
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: true,
          isOtpSent: false
        }));
        toast.success('Phone already verified!');
      } else {
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: false
        }));
      }
    } catch (error) {
      console.error('Phone check error:', error);
    }
  };

  // Send OTP - USING AXIOS CLIENT
  const sendOtp = async () => {
    if (!phoneValue || phoneValue.length !== 10) {
      toast.error('Please enter valid 10-digit mobile number');
      return;
    }

    setLoading(prev => ({ ...prev, sendingOtp: true }));
    
    try {
      const response = await axiosClient.post('/otp/send', {
        countryCode: '91',
        mobileNumber: phoneValue
      });

      if (response.data.success) {
        setPhoneVerification(prev => ({
          ...prev,
          isOtpSent: true,
          verificationId: response.data.verificationId
        }));
        setShowOtpModal(true);
        toast.success('OTP sent successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(prev => ({ ...prev, sendingOtp: false }));
    }
  };

  // Verify OTP - USING AXIOS CLIENT
  const verifyOtp = async () => {
    if (!phoneVerification.otp || phoneVerification.otp.length !== 4) {
      toast.error('Please enter 4-digit OTP');
      return;
    }

    setLoading(prev => ({ ...prev, verifyingOtp: true }));

    try {
      const response = await axiosClient.post('/otp/verify', {
        countryCode: '91',
        mobileNumber: phoneValue,
        verificationId: phoneVerification.verificationId,
        code: phoneVerification.otp
      });

      if (response.data.success) {
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: true,
          isOtpSent: false,
          otp: ''
        }));
        setShowOtpModal(false);
        toast.success('Phone verified successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(prev => ({ ...prev, verifyingOtp: false }));
    }
  };

  // ✅ MAIN FIX: Create order with proper endpoint and data
  const onSubmit = async (data) => {
    if (!phoneVerification.isVerified) {
      toast.error('Phone verification is required');
      return;
    }

    setLoading(prev => ({ ...prev, creatingOrder: true }));

    try {
      const transformedItems = transformCartItems(cartItems);
      
      const orderData = {
        userName: data.userName,
        phone: data.phone,
        address: data.address,
        items: transformedItems,
        paymentMethod: data.paymentMethod,
        orderNotes: data.orderNotes,
        specialInstructions: data.specialInstructions,
        deliveryPreferences: data.deliveryPreferences,
        // ✅ Add totals
        subtotal: subtotal,
        deliveryCharges: deliveryCharges,
        totalAmount: totalAmount
      };

      console.log('Order data being sent:', orderData);

      // ✅ MAIN FIX: Correct API endpoint
      const response = await axiosClient.post('/cashfree/create', orderData);

      if (response.data.success) {
        const { order } = response.data;

        if (data.paymentMethod === 'cod') {
          toast.success('🎉 COD Order placed successfully!');
          onOrderSuccess && onOrderSuccess(order);
        } else {
          // Cashfree payment
          if (order.paymentSessionId) {
            toast.success('Payment session created. Redirecting to payment...');
            initializeCashfreePayment(order);
          } else {
            throw new Error('Payment session not created');
          }
        }
      }
    } catch (error) {
      console.error('Order creation error:', error.response?.data);
      toast.error('Failed to create order: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, creatingOrder: false }));
    }
  };

  // ✅ FIXED: Initialize Cashfree Payment with return URL
  const initializeCashfreePayment = (order) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    
    script.onload = () => {
      try {
        const cashfree = window.Cashfree({
          mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });

        const checkoutOptions = {
          paymentSessionId: order.paymentSessionId,
          redirectTarget: '_self',
          // ✅ FIXED: Add return URL for payment callback
          returnUrl: `${window.location.origin}/payment-callback?order_id=${order.orderId || order.cashfreeOrderId}&payment=success`
        };

        console.log('Initializing Cashfree with options:', checkoutOptions);

        cashfree.checkout(checkoutOptions).then((result) => {
          console.log('Cashfree checkout result:', result);
          
          if (result.error) {
            console.error('Cashfree checkout error:', result.error);
            toast.error('Payment initialization failed: ' + result.error.message);
          }
          
          if (result.redirect) {
            console.log('Redirecting to payment page...');
          }
        }).catch((error) => {
          console.error('Cashfree SDK error:', error);
          toast.error('Payment failed to initialize');
        });
      } catch (error) {
        console.error('Cashfree initialization error:', error);
        toast.error('Payment system error');
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load Cashfree SDK:', error);
      toast.error('Payment system unavailable. Please try again.');
    };

    document.head.appendChild(script);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 sm:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Premium Header */}
          <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-5"></div>
            <div className="relative p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Secure Checkout
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Complete your order with our secure, encrypted checkout process
              </p>
              <div className="flex items-center justify-center mt-8 space-x-8">
                <div className="flex items-center space-x-2 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-semibold">SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-semibold">256-bit Encryption</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Form */}
            <div className="xl:col-span-3 space-y-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Contact Information */}
                <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 h-2"></div>
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                        <p className="text-gray-600">Enter your contact details</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register('userName', { required: 'Full name is required' })}
                            type="text"
                            placeholder="Enter your full name"
                            className={`w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${errors.userName ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        {errors.userName && (
                          <p className="text-red-600 text-sm flex items-center font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.userName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">
                              +91
                            </div>
                            <input
                              {...register('phone', { 
                                required: 'Mobile number is required',
                                pattern: {
                                  value: /^[6-9]\d{9}$/,
                                  message: 'Enter valid 10-digit mobile number'
                                }
                              })}
                              type="tel"
                              placeholder="Enter 10-digit number"
                              className={`w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                                errors.phone ? 'border-red-400 bg-red-50' : 
                                phoneVerification.isVerified ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              maxLength="10"
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              }}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              {phoneVerification.isVerified ? (
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              )}
                            </div>
                          </div>
                          {!phoneVerification.isVerified && (
                            <button
                              type="button"
                              onClick={sendOtp}
                              disabled={loading.sendingOtp || !phoneValue || phoneValue.length !== 10}
                              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
                            >
                              {loading.sendingOtp ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <span>{phoneVerification.isOtpSent ? 'Resend' : 'Send OTP'}</span>
                              )}
                            </button>
                          )}
                        </div>
                        {errors.phone && (
                          <p className="text-red-600 text-sm flex items-center font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Delivery Address */}
                <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 h-2"></div>
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                        <p className="text-gray-600">Where should we deliver your order?</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Flat/House No/Building <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('address.flatHouse', { required: 'House details are required' })}
                          type="text"
                          placeholder="e.g., A-101, Green Valley Apartments"
                          className={`w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${errors.address?.flatHouse ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                        {errors.address?.flatHouse && (
                          <p className="text-red-600 text-sm flex items-center font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.address.flatHouse.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Area/Street/Sector <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('address.areaStreet', { required: 'Area/Street is required' })}
                          type="text"
                          placeholder="e.g., Sector 15, Golf Course Road"
                          className={`w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${errors.address?.areaStreet ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                        {errors.address?.areaStreet && (
                          <p className="text-red-600 text-sm flex items-center font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.address.areaStreet.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Landmark <span className="text-gray-500 text-xs">(Optional)</span>
                        </label>
                        <input
                          {...register('address.landmark')}
                          type="text"
                          placeholder="e.g., Near City Mall, Opposite Metro Station"
                          className="w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-gray-300 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('address.city', { required: 'City is required' })}
                          type="text"
                          placeholder="Enter city"
                          className={`w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${errors.address?.city ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                        {errors.address?.city && (
                          <p className="text-red-600 text-sm flex items-center font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.address.city.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('address.state', { required: 'State is required' })}
                          className={`w-full px-4 py-4 text-gray-900 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${errors.address?.state ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <option value="" className="text-gray-500">Select State</option>
                          <option value="Delhi" className="text-gray-900">Delhi</option>
                          <option value="Maharashtra" className="text-gray-900">Maharashtra</option>
                          <option value="Karnataka" className="text-gray-900">Karnataka</option>
                          <option value="Tamil Nadu" className="text-gray-900">Tamil Nadu</option>
                          <option value="Gujarat" className="text-gray-900">Gujarat</option>
                          <option value="Uttar Pradesh" className="text-gray-900">Uttar Pradesh</option>
                          <option value="West Bengal" className="text-gray-900">West Bengal</option>
                          <option value="Rajasthan" className="text-gray-900">Rajasthan</option>
                          <option value="Haryana" className="text-gray-900">Haryana</option>
                          <option value="Punjab" className="text-gray-900">Punjab</option>
                        </select>
                        {errors.address?.state && (
                          <p className="text-red-600 text-sm flex items-center font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.address.state.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('address.pincode', { 
                            required: 'Pincode is required',
                            pattern: {
                              value: /^[1-9][0-9]{5}$/,
                              message: 'Enter valid 6-digit pincode'
                            }
                          })}
                          type="text"
                          placeholder="6-digit pincode"
                          className={`w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${errors.address?.pincode ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                          maxLength="6"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          }}
                        />
                        {errors.address?.pincode && (
                          <p className="text-red-600 text-sm flex items-center font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.address.pincode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 h-2"></div>
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                        <p className="text-gray-600">Choose your preferred payment option</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <label className="cursor-pointer group">
                        <input 
                          {...register('paymentMethod')}
                          type="radio" 
                          value="cashfree" 
                          className="sr-only" 
                        />
                        <div className={`relative p-6 border-2 rounded-2xl transition-all duration-200 group-hover:shadow-lg ${
                          paymentMethod === 'cashfree' 
                            ? 'border-blue-500 bg-blue-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                              paymentMethod === 'cashfree' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'cashfree' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg">Online Payment</h3>
                              <p className="text-gray-600 text-sm">Cards, UPI, Net Banking, Wallets</p>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  Instant
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  Secure
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className="cursor-pointer group">
                        <input 
                          {...register('paymentMethod')}
                          type="radio" 
                          value="cod" 
                          className="sr-only" 
                        />
                        <div className={`relative p-6 border-2 rounded-2xl transition-all duration-200 group-hover:shadow-lg ${
                          paymentMethod === 'cod' 
                            ? 'border-green-500 bg-green-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-green-300'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                              paymentMethod === 'cod' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'cod' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg">Cash on Delivery</h3>
                              <p className="text-gray-600 text-sm">Pay when you receive your order</p>
                              <div className="flex items-center mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  Available
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Delivery Charges:</span>
                        <span className="font-bold text-gray-900">₹{deliveryCharges}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Delivery Preferences & Additional Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Delivery Preferences */}
                  <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 h-2"></div>
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Delivery Options</h3>
                          <p className="text-gray-600 text-sm">Set your preferences</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Preferred Time Slot
                          </label>
                          <select 
                            {...register('deliveryPreferences.preferredTimeSlot')}
                            className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200"
                          >
                            <option value="any">Any Time</option>
                            <option value="morning">Morning (9 AM - 12 PM)</option>
                            <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                            <option value="evening">Evening (6 PM - 9 PM)</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <label className="flex items-start cursor-pointer group">
                            <input 
                              {...register('deliveryPreferences.leaveAtDoor')}
                              type="checkbox" 
                              className="mt-1 w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-200"
                            />
                            <div className="ml-3">
                              <span className="font-medium text-gray-900">Leave at door</span>
                              <p className="text-sm text-gray-600">Safe to leave at doorstep if unavailable</p>
                            </div>
                          </label>

                          <label className="flex items-start cursor-pointer group">
                            <input 
                              {...register('deliveryPreferences.callBeforeDelivery')}
                              type="checkbox" 
                              className="mt-1 w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-200"
                              defaultChecked
                            />
                            <div className="ml-3">
                              <span className="font-medium text-gray-900">Call before delivery</span>
                              <p className="text-sm text-gray-600">Get notified before arrival</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Additional Information */}
                  <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 h-2"></div>
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Additional Notes</h3>
                          <p className="text-gray-600 text-sm">Optional information</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Order Notes
                          </label>
                          <textarea
                            {...register('orderNotes')}
                            className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 resize-none"
                            placeholder="Any special requests..."
                            rows="3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Special Instructions
                          </label>
                          <textarea
                            {...register('specialInstructions')}
                            className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 resize-none"
                            placeholder="Dietary restrictions, etc..."
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="text-center pt-6">
                  <button
                    type="submit"
                    disabled={loading.creatingOrder || !phoneVerification.isVerified}
                    className={`inline-flex items-center justify-center w-full max-w-2xl px-8 py-6 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none`}
                  >
                    {loading.creatingOrder ? (
                      <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        {paymentMethod === 'cod' ? (
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        )}
                        {paymentMethod === 'cod' ? 'Place COD Order' : 'Proceed to Payment'}
                        <span className="ml-4 px-4 py-2 bg-white bg-opacity-20 rounded-full font-mono">
                          ₹{totalAmount}
                        </span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center mt-6 text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your information is secure and encrypted
                  </div>
                </motion.div>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <div className="sticky top-6 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                    </svg>
                    <h2 className="text-xl font-bold">Order Summary</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-2xl">
                        <img 
                          src={item.image || item.product_image} 
                          alt={item.name || item.product_name} 
                          className="w-14 h-14 rounded-xl object-cover shadow-sm mr-4"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name || item.product_name}</h4>
                          <p className="text-xs text-gray-600">Qty: {item.quantity} × ₹{item.price || item.product_price}</p>
                        </div>
                        <span className="font-bold text-indigo-600 text-sm ml-2">₹{item.quantity * (item.price || item.product_price)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Delivery:</span>
                      <span className="font-semibold">₹{deliveryCharges}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total:</span>
                        <span className="text-indigo-600">₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mt-6">
                    <div className="flex items-center text-green-700">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Free delivery on orders above ₹500</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* OTP Verification Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm"
              onClick={() => setShowOtpModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Verify Phone Number</h2>
                    <p className="text-blue-100 mt-2">Enter the 4-digit OTP sent to your phone</p>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-center text-gray-700 mb-6">
                    OTP sent to <span className="font-semibold text-blue-600">+91 {phoneValue}</span>
                  </p>
                  
                  <div className="mb-8">
                    <input
                      type="text"
                      value={phoneVerification.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPhoneVerification(prev => ({ ...prev, otp: value }));
                      }}
                      placeholder="0000"
                      className="w-full px-6 py-4 text-center text-3xl font-bold tracking-widest text-gray-900 placeholder-gray-400 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      maxLength="4"
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowOtpModal(false)}
                      className="flex-1 px-6 py-4 text-gray-700 font-semibold bg-gray-100 rounded-2xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verifyOtp}
                      disabled={loading.verifyingOtp || phoneVerification.otp.length !== 4}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading.verifyingOtp ? (
                        <svg className="w-5 h-5 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Verify OTP'
                      )}
                    </button>
                  </div>

                  <div className="text-center mt-6">
                    <button
                      onClick={sendOtp}
                      disabled={loading.sendingOtp}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      {loading.sendingOtp ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
