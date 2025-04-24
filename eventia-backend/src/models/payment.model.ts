import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export enum PaymentStatus {
  PENDING = 'pending',
  PENDING_VERIFICATION = 'pending_verification',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PaymentMethod {
  UPI = 'upi',
  CARD = 'card',
  NET_BANKING = 'net_banking'
}

export interface PaymentAttributes {
  id: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentIntentId?: string;
  paymentMethod: PaymentMethod;
  utrNumber?: string;
  paymentDate?: Date;
  userId: number;
  bookingId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCreationAttributes extends Omit<PaymentAttributes, 'id'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number;
  public amount!: number;
  public currency!: string;
  public status!: PaymentStatus;
  public paymentIntentId?: string;
  public paymentMethod!: PaymentMethod;
  public utrNumber?: string;
  public paymentDate?: Date;
  public userId!: number;
  public bookingId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public readonly user?: any;
  public readonly booking?: any;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'INR',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
      defaultValue: PaymentMethod.UPI,
    },
    utrNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'payments',
  }
);