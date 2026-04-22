import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      label: {
        type: String,
        trim: true,
        default: 'Home',
      },
      line1: {
        type: String,
        required: [true, 'Delivery address is required.'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Delivery city is required.'],
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
        default: '',
      },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online', 'wallet'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
