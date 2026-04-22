import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required.'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Item slug is required.'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'Signature',
    },
    price: {
      type: Number,
      required: [true, 'Item price is required.'],
      min: [0, 'Item price cannot be negative.'],
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    prepTimeMinutes: {
      type: Number,
      min: 5,
      default: 20,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
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

itemSchema.index({ shop: 1, category: 1, name: 1 });
itemSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Item = mongoose.model('Item', itemSchema);
