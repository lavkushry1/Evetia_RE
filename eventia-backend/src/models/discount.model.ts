import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscount extends Document {
  code: string;
  percentage: number;
  amount: number;
  startDate: Date;
  endDate: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
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
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    amount: {
      type: Number,
      required: true,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

discountSchema.methods.isExpired = function(): boolean {
  const now = new Date();
  return (
    now < this.startDate ||
    now > this.endDate ||
    this.currentUses >= this.maxUses ||
    !this.isActive
  );
};

export const Discount = mongoose.model<IDiscount>('Discount', discountSchema); 