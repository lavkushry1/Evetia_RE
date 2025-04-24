import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export interface DiscountAttributes {
  id: number;
  code: string;
  amount: number;
  description?: string;
  maxUses: number;
  usesCount: number;
  expiryDate?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DiscountCreationAttributes extends Omit<DiscountAttributes, 'id' | 'usesCount'> {}

export class Discount extends Model<DiscountAttributes, DiscountCreationAttributes> implements DiscountAttributes {
  public id!: number;
  public code!: string;
  public amount!: number;
  public description!: string;
  public maxUses!: number;
  public usesCount!: number;
  public expiryDate!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  isExpired(): boolean {
    if (!this.isActive) return true;
    if (this.usesCount >= this.maxUses) return true;
    if (this.expiryDate && new Date() > this.expiryDate) return true;
    return false;
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  applyDiscount(amount: number): number {
    if (!this.isValid()) return amount;
    return Math.max(0, amount - this.amount);
  }
}

Discount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    usesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'discounts',
  }
); 