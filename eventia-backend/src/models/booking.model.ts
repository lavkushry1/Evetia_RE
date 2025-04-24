import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export interface BookingAttributes {
  id: number;
  userId: number;
  eventId: number;
  status: string;
  totalAmount: number;
  seats: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingCreationAttributes extends Omit<BookingAttributes, 'id'> {}

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public userId!: number;
  public eventId!: number;
  public status!: string;
  public totalAmount!: number;
  public seats!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public readonly event?: any;
  public readonly user?: any;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    seats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'bookings',
  }
); 