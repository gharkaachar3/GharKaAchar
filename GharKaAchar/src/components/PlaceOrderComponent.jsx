import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get checkout items
  const [checkoutItems, setCheckoutItems] = useState([]);
  
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  // Address form
  const [addressForm, setAddressForm] = useState({
    userName: '',
    flatHouse: '',
    areaStreet: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  // Delivery preferences
  const [deliveryPreferences, setDeliveryPreferences] = useState({
    preferredTimeSlot: 'any',
    leaveAtDoor: false,
    callBeforeDelivery: true
  });
  
  // Payment and notes
  const [paymentMethod, setPaymentMethod] = useState('cashfree');
  const [orderNotes, setOrderNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Loading states
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize checkout items
  useEffect(() => {
    const state = location.state;
    
    if (state?.directCheckout && state?.product) {
      // Direct checkout from PDP
      setCheckoutItems([{
        productId: state.product._id,
        name: state.product.name,
        image: state.product.images?.[0],
        quantity: state.quantity || 1,
        price: state.product.price,
        weight: state.product.weight,
        itemTotal: (state.quantity || 1) * state.product.price
      }]);
    } else if (state?.cartItems && state.cartItems.length > 0) {
      // Checkout from cart
      setCheckoutItems(state.cartItems);
    } else {
      // No items, redirect back
      navigate('/cart');
    }
  }, [location.state, navigate]);

  // Calculate totals
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const shippingCost = paymentMethod === 'cod' ? 75 : 50;
  const codCharges = paymentMethod === 'cod' ? 25 : 0;
  const totalAmount = subtotal + shippingCost;

  // Send OTP
  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setErrors({ phone: 'Please enter a valid 10-digit mobile number starting with 6-9' });
      return;
    }

    setIsOtpLoading(true);
    setErrors({});
    
    try {
      const response = await axios.post('/api/auth/send-otp', {
        countryCode: '91',
        mobileNumber: phoneNumber
      });
      
      if (response.data.success) {
        setVerificationId(response.data.verificationId);
        // Show success toast
        document.getElementById('otp-toast').checked = true;
      }
    } catch (error) {
      setErrors({ phone: error.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setIsOtpLoading(true);
    setErrors({});
    
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        countryCode: '91',
        mobileNumber: phoneNumber,
        verificationId,
        code: otp
      });
      
      if (response.data.success) {
        setIsPhoneVerified(true);
        setCurrentStep(2);
      }
    } catch (error) {
      setErrors({ otp: error.response?.data?.message || 'Invalid OTP' });
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Validate address
  const validateAddress = () => {
    const newErrors = {};
    
    if (!addressForm.userName.trim()) newErrors.userName = 'Name is required';
    if (!addressForm.flatHouse.trim()) newErrors.flatHouse = 'Flat/House number is required';
    if (!addressForm.areaStreet.trim()) newErrors.areaStreet = 'Area/Street is required';
    if (!addressForm.city.trim()) newErrors.city = 'City is required';
    if (!addressForm.state) newErrors.state = 'State is required';
    if (!/^[1-9][0-9]{5}$/.test(addressForm.pincode)) newErrors.pincode = 'Please enter a valid 6-digit pincode';
    
    return newErrors;
  };

  // Submit order
  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setErrors({});

    const orderData = {
      userName: addressForm.userName,
      phone: phoneNumber,
      address: {
        flatHouse: addressForm.flatHouse,
        areaStreet: addressForm.areaStreet,
        landmark: addressForm.landmark,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        country: 'India'
      },
      items: checkoutItems,
      paymentMethod,
      orderNotes,
      specialInstructions,
      deliveryPreferences
    };

    try {
      const response = await axios.post('/api/orders/create', orderData);
      
      if (response.data.success) {
        if (paymentMethod === 'cod') {
          navigate('/order-success', { 
            state: { 
              orderId: response.data.order.orderId,
              paymentMethod: 'cod'
            }
          });
        } else {
          // Redirect to Cashfree payment
          navigate('/payment', {
            state: {
              orderId: response.data.order.orderId,
              paymentSessionId: response.data.order.paymentSessionId,
              amount: response.data.order.totalAmount
            }
          });
        }
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create order' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step variants for animations
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="card bg-base-100 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Progress Steps */}
            <div className="card-body p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 1 ? 'bg-primary text-primary-content' : 'bg-base-300'
                  } ${isPhoneVerified ? 'bg-success' : ''}`}>
                    {isPhoneVerified ? '✓' : '1'}
                  </div>
                  <span className={`hidden sm:block ${currentStep >= 1 ? 'text-primary font-semibold' : 'text-base-content/60'}`}>
                    Phone Verification
                  </span>
                </div>
                
                <div className="h-px bg-base-300 flex-1 mx-4"></div>
                
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 2 ? 'bg-primary text-primary-content' : 'bg-base-300'
                  } ${currentStep > 2 ? 'bg-success' : ''}`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                  <span className={`hidden sm:block ${currentStep >= 2 ? 'text-primary font-semibold' : 'text-base-content/60'}`}>
                    Delivery Address
                  </span>
                </div>
                
                <div className="h-px bg-base-300 flex-1 mx-4"></div>
                
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 3 ? 'bg-primary text-primary-content' : 'bg-base-300'
                  }`}>
                    3
                  </div>
                  <span className={`hidden sm:block ${currentStep >= 3 ? 'text-primary font-semibold' : 'text-base-content/60'}`}>
                    Payment & Review
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1: Phone Verification */}
                {currentStep === 1 && !isPhoneVerified && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-base-content mb-2">📱 Verify Your Phone</h2>
                      <p className="text-base-content/70">We'll send you an OTP to verify your phone number</p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Mobile Number</span>
                        </label>
                        <div className="join">
                          <span className="join-item btn btn-disabled">+91</span>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Enter 10-digit mobile number"
                            className={`input input-bordered join-item flex-1 ${errors.phone ? 'input-error' : ''}`}
                          />
                        </div>
                        {errors.phone && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.phone}</span>
                          </label>
                        )}
                      </div>

                      {!verificationId ? (
                        <button 
                          onClick={handleSendOTP}
                          disabled={isOtpLoading}
                          className="btn btn-primary w-full"
                        >
                          {isOtpLoading && <span className="loading loading-spinner loading-sm"></span>}
                          {isOtpLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4"
                        >
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold">Enter OTP</span>
                            </label>
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit OTP"
                              className={`input input-bordered ${errors.otp ? 'input-error' : ''}`}
                            />
                            {errors.otp && (
                              <label className="label">
                                <span className="label-text-alt text-error">{errors.otp}</span>
                              </label>
                            )}
                          </div>
                          
                          <div className="flex gap-4">
                            <button 
                              onClick={handleVerifyOTP}
                              disabled={isOtpLoading}
                              className="btn btn-primary flex-1"
                            >
                              {isOtpLoading && <span className="loading loading-spinner loading-sm"></span>}
                              {isOtpLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button 
                              onClick={handleSendOTP}
                              disabled={isOtpLoading}
                              className="btn btn-outline"
                            >
                              Resend
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Address Form */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-base-content mb-2">🏠 Delivery Address</h2>
                      <p className="text-base-content/70">Enter your complete delivery address</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Full Name *</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.userName}
                            onChange={(e) => setAddressForm(prev => ({...prev, userName: e.target.value}))}
                            placeholder="Enter your full name"
                            className={`input input-bordered ${errors.userName ? 'input-error' : ''}`}
                          />
                          {errors.userName && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.userName}</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Flat/House No, Building Name *</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.flatHouse}
                            onChange={(e) => setAddressForm(prev => ({...prev, flatHouse: e.target.value}))}
                            placeholder="e.g., Flat 101, ABC Apartments"
                            className={`input input-bordered ${errors.flatHouse ? 'input-error' : ''}`}
                          />
                          {errors.flatHouse && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.flatHouse}</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Area, Street, Sector, Village *</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.areaStreet}
                            onChange={(e) => setAddressForm(prev => ({...prev, areaStreet: e.target.value}))}
                            placeholder="e.g., Sector 18, Golf Course Road"
                            className={`input input-bordered ${errors.areaStreet ? 'input-error' : ''}`}
                          />
                          {errors.areaStreet && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.areaStreet}</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Landmark (Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.landmark}
                            onChange={(e) => setAddressForm(prev => ({...prev, landmark: e.target.value}))}
                            placeholder="e.g., Near Metro Station, Opposite Mall"
                            className="input input-bordered"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">City *</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({...prev, city: e.target.value}))}
                            placeholder="Enter city"
                            className={`input input-bordered ${errors.city ? 'input-error' : ''}`}
                          />
                          {errors.city && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.city}</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Pincode *</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm(prev => ({...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)}))}
                            placeholder="Enter 6-digit pincode"
                            className={`input input-bordered ${errors.pincode ? 'input-error' : ''}`}
                          />
                          {errors.pincode && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.pincode}</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">State *</span>
                          </label>
                          <select
                            value={addressForm.state}
                            onChange={(e) => setAddressForm(prev => ({...prev, state: e.target.value}))}
                            className={`select select-bordered ${errors.state ? 'select-error' : ''}`}
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          {errors.state && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.state}</span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Preferences */}
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="card-title text-lg">📦 Delivery Preferences</h3>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Preferred Delivery Time</span>
                          </label>
                          <select
                            value={deliveryPreferences.preferredTimeSlot}
                            onChange={(e) => setDeliveryPreferences(prev => ({
                              ...prev,
                              preferredTimeSlot: e.target.value
                            }))}
                            className="select select-bordered"
                          >
                            <option value="any">Any Time</option>
                            <option value="morning">Morning (9 AM - 12 PM)</option>
                            <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                            <option value="evening">Evening (6 PM - 9 PM)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <div className="form-control">
                            <label className="label cursor-pointer justify-start">
                              <input
                                type="checkbox"
                                checked={deliveryPreferences.callBeforeDelivery}
                                onChange={(e) => setDeliveryPreferences(prev => ({
                                  ...prev,
                                  callBeforeDelivery: e.target.checked
                                }))}
                                className="checkbox checkbox-primary mr-3"
                              />
                              <span className="label-text">Call before delivery</span>
                            </label>
                          </div>
                          
                          <div className="form-control">
                            <label className="label cursor-pointer justify-start">
                              <input
                                type="checkbox"
                                checked={deliveryPreferences.leaveAtDoor}
                                onChange={(e) => setDeliveryPreferences(prev => ({
                                  ...prev,
                                  leaveAtDoor: e.target.checked
                                }))}
                                className="checkbox checkbox-primary mr-3"
                              />
                              <span className="label-text">Leave at door if not available</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => setCurrentStep(1)} 
                        className="btn btn-outline flex-1"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          const addressErrors = validateAddress();
                          if (Object.keys(addressErrors).length > 0) {
                            setErrors(addressErrors);
                            return;
                          }
                          setErrors({});
                          setCurrentStep(3);
                        }}
                        className="btn btn-primary flex-1"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment & Review */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-base-content mb-2">💳 Payment & Review</h2>
                      <p className="text-base-content/70">Review your order and choose payment method</p>
                    </div>

                    {/* Order Summary */}
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="card-title">📋 Order Summary</h3>
                        
                        <div className="space-y-4">
                          {checkoutItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-base-100 rounded-lg">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-base-content/70">{item.weight}</p>
                                <p className="text-sm text-base-content/70">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₹{item.itemTotal.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="divider"></div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal ({checkoutItems.length} items)</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping Fee</span>
                            <span>₹{shippingCost}</span>
                          </div>
                          {paymentMethod === 'cod' && (
                            <div className="flex justify-between text-warning">
                              <span>COD Charges</span>
                              <span>₹{codCharges}</span>
                            </div>
                          )}
                          <div className="divider"></div>
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total Amount</span>
                            <span>₹{totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="card-title">💳 Payment Method</h3>
                        
                        <div className="space-y-4">
                          <div className={`card cursor-pointer transition-all ${
                            paymentMethod === 'cashfree' ? 'ring-2 ring-primary bg-primary/10' : 'bg-base-100 hover:bg-base-300'
                          }`} onClick={() => setPaymentMethod('cashfree')}>
                            <div className="card-body py-4">
                              <div className="flex items-center space-x-4">
                                <input
                                  type="radio"
                                  name="payment"
                                  value="cashfree"
                                  checked={paymentMethod === 'cashfree'}
                                  onChange={() => setPaymentMethod('cashfree')}
                                  className="radio radio-primary"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl">💳</span>
                                    <div>
                                      <h4 className="font-semibold">Online Payment</h4>
                                      <p className="text-sm text-base-content/70">Pay securely using Card/UPI/Net Banking</p>
                                      <p className="text-sm text-success">Shipping: ₹50</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={`card cursor-pointer transition-all ${
                            paymentMethod === 'cod' ? 'ring-2 ring-primary bg-primary/10' : 'bg-base-100 hover:bg-base-300'
                          }`} onClick={() => setPaymentMethod('cod')}>
                            <div className="card-body py-4">
                              <div className="flex items-center space-x-4">
                                <input
                                  type="radio"
                                  name="payment"
                                  value="cod"
                                  checked={paymentMethod === 'cod'}
                                  onChange={() => setPaymentMethod('cod')}
                                  className="radio radio-primary"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl">💸</span>
                                    <div>
                                      <h4 className="font-semibold">Cash on Delivery</h4>
                                      <p className="text-sm text-base-content/70">Pay when you receive your order</p>
                                      <p className="text-sm text-warning">Additional ₹25 COD charges + ₹50 shipping</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Order Notes (Optional)</span>
                        </label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Any special instructions for your order..."
                          className="textarea textarea-bordered h-24"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Special Instructions (Optional)</span>
                        </label>
                        <textarea
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="Special delivery instructions..."
                          className="textarea textarea-bordered h-24"
                        />
                      </div>
                    </div>

                    {errors.submit && (
                      <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errors.submit}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => setCurrentStep(2)} 
                        className="btn btn-outline flex-1"
                      >
                        Back to Address
                      </button>
                      <button 
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="btn btn-primary flex-1 text-lg"
                      >
                        {isSubmitting && <span className="loading loading-spinner loading-md"></span>}
                        {isSubmitting ? 'Placing Order...' : `Place Order - ₹${totalAmount.toLocaleString()}`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Toast */}
      <input type="checkbox" id="otp-toast" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">✅ OTP Sent!</h3>
          <p className="py-4">We've sent a 6-digit OTP to your mobile number. Please check and enter it above.</p>
          <div className="modal-action">
            <label htmlFor="otp-toast" className="btn btn-primary">Got it!</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
