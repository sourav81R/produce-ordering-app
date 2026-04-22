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
      enum: ['kg', 'piece'],
      required: [true, 'Product unit is required.'],
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model('Product', productSchema);
