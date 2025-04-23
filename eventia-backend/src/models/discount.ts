import { Schema, model } from 'mongoose';

export interface IDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses: number;
  currentUses: number;
  startDate: Date;
  endDate: Date;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maxUses: {
      type: Number,
      required: true,
      min: 0,
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    minPurchaseAmount: {
      type: Number,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

export const Discount = model<IDiscount>('Discount', discountSchema); 