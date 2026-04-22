import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required.'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Shop slug is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: {
      type: String,
      required: [true, 'City is required.'],
      trim: true,
    },
    cuisineTags: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    etaMinutes: {
      type: Number,
      min: 5,
      default: 30,
    },
    deliveryFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    minOrder: {
      type: Number,
      min: 0,
      default: 0,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

shopSchema.index({ city: 1, name: 1 });
shopSchema.index({ cuisineTags: 1 });

export const Shop = mongoose.model('Shop', shopSchema);
