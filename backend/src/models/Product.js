import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Vegetable', 'Fruit'],
      required: [true, 'Product category is required.'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Product price cannot be negative.'],
    },
    unit: {
      type: String,
      enum: ['kg', 'piece', 'dozen', 'bundle'],
      required: [true, 'Product unit is required.'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    imageAlt: {
      type: String,
      default: '',
      trim: true,
    },
    supplier: {
      type: String,
      default: '',
      trim: true,
    },
    origin: {
      type: String,
      default: '',
      trim: true,
    },
    packSize: {
      type: String,
      default: '',
      trim: true,
    },
    stockLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: 1,
    },
    deliveryWindow: {
      type: String,
      default: '',
      trim: true,
    },
    qualityGrade: {
      type: String,
      default: '',
      trim: true,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    emoji: {
      type: String,
      default: 'PR',
      trim: true,
    },
    color: {
      type: String,
      default: '#4CAF50',
      trim: true,
    },
    tag: {
      type: String,
      enum: ['bestseller', 'organic', 'seasonal', 'new', 'premium', null],
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, name: 1 });

export const Product = mongoose.model('Product', productSchema);
