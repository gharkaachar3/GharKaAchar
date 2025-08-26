const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // User Information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v); // Indian mobile validation
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },

  // ✅ Enhanced Shipping Address with All Required Fields
  address: {
    // Enhanced address fields from checkout form
    flatHouse: { 
      type: String, 
      required: true,
      trim: true
    },
    areaStreet: { 
      type: String, 
      required: true,
      trim: true
    },
    landmark: { 
      type: String,
      trim: true,
      default: ''
    },
    city: { 
      type: String, 
      required: true,
      trim: true
    },
    state: { 
      type: String, 
      required: true,

    },
    pincode: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^[1-9][0-9]{5}$/.test(v); 
        },
        message: 'Please enter a valid 6-digit pincode'
      }
    },
    country: { 
      type: String, 
      default: 'India' 
    },
    // Formatted complete address for delivery
    fullAddress: {
      type: String,
      default: function() {
        return `${this.address.flatHouse}, ${this.address.areaStreet}${this.address.landmark ? ', ' + this.address.landmark : ''}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
      }
    }
  },

  // Order Identifiers
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },

  // ✅ Cashfree Payment Information
  cashfreeOrderId: { 
    type: String, // Cashfree generated order ID
    default: null 
  },
  paymentId: { 
    type: String, // Cashfree payment ID when paid
    default: null 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'cod'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cashfree', 'cod'], 
    required: true
  },

  // Items List
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    image: { 
      type: String 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1 
    },
    price: { 
      type: Number, 
      required: true 
    },
    weight: { 
      type: String 
    },
    // Auto-calculated per item total
    itemTotal: {
      type: Number,
      default: function() {
        return this.quantity * this.price;
      }
    }
  }],

  // Calculated Totals
  subtotal: { 
    type: Number, 
    required: true 
  },
  shippingCost: { 
    type: Number, 
    default: function() {
      // COD charges additional ₹25
      return this.paymentMethod === 'cod' ? 75 : 50;
    }
  },
  codCharges: {
    type: Number,
    default: function() {
      return this.paymentMethod === 'cod' ? 25 : 0;
    }
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },

  // Order Status and Tracking
  orderStatus: { 
    type: String, 
    enum: ['created', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], 
    default: 'created' 
  },

  // ✅ Order Timeline Tracking
  orderTimeline: [{
    status: {
      type: String,
      enum: ['created', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    }
  }],

  // Additional Information
  orderNotes: { 
    type: String,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },

  // ✅ Delivery Preferences
  deliveryPreferences: {
    preferredTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'any'],
      default: 'any'
    },
    leaveAtDoor: {
      type: Boolean,
      default: false
    },
    callBeforeDelivery: {
      type: Boolean,
      default: true
    }
  },

  // ✅ Customer Service Fields
  customerQueries: [{
    query: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // ✅ Admin Notes
  adminNotes: {
    type: String,
    trim: true
  },

  // ✅ Inventory Management
  inventoryReserved: {
    type: Boolean,
    default: false
  },
  inventoryReservedAt: {
    type: Date
  }

}, {
  timestamps: true // createdAt, updatedAt
});

// ✅ Enhanced Pre-save middleware
orderSchema.pre('save', function(next) {
  // Calculate totals
  if (this.items && this.items.length > 0) {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    // Set COD charges if COD payment method
    if (this.paymentMethod === 'cod') {
      this.codCharges = 25;
      this.shippingCost = 75; // Base shipping + COD charges
      this.paymentStatus = 'cod';
    } else {
      this.codCharges = 0;
      this.shippingCost = 50;
    }
    
    // Calculate final total
    this.totalAmount = this.subtotal + this.shippingCost - this.discount;
  }

  // Auto-generate full address
  if (this.address && this.address.flatHouse && this.address.areaStreet) {
    this.address.fullAddress = `${this.address.flatHouse}, ${this.address.areaStreet}${this.address.landmark ? ', ' + this.address.landmark : ''}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
  }

  // Add to timeline if status changed
  if (this.isModified('orderStatus')) {
    this.orderTimeline.push({
      status: this.orderStatus,
      timestamp: new Date(),
      note: `Order status updated to ${this.orderStatus}`
    });
  }
  
  next();
});

// ✅ Instance Methods
orderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.orderStatus = newStatus;
  this.orderTimeline.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Order status updated to ${newStatus}`
  });
  return this.save();
};

orderSchema.methods.addCustomerQuery = function(query, response = '') {
  this.customerQueries.push({
    query: query,
    response: response,
    timestamp: new Date()
  });
  return this.save();
};

orderSchema.methods.getFormattedAddress = function() {
  return this.address.fullAddress || `${this.address.flatHouse}, ${this.address.areaStreet}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
};

// ✅ Static Methods
orderSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findPendingOrders = function() {
  return this.find({ orderStatus: { $in: ['created', 'confirmed', 'processing'] } });
};

orderSchema.statics.getOrderStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// ✅ Virtual Fields
orderSchema.virtual('isPaymentComplete').get(function() {
  return this.paymentStatus === 'paid' || this.paymentStatus === 'cod';
});

orderSchema.virtual('canBeCancelled').get(function() {
  return ['created', 'confirmed'].includes(this.orderStatus);
});

orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // in days
});

// ✅ Indexes for performance
orderSchema.index({ userId: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ cashfreeOrderId: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'address.pincode': 1 });
orderSchema.index({ 'address.city': 1 });
orderSchema.index({ totalAmount: 1 });

module.exports = mongoose.model('Order', orderSchema);
