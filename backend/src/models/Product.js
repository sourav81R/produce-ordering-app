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
    emoji: {
      type: String,
      default: '🌿',
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
