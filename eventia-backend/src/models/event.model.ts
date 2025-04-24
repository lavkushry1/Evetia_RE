import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export interface EventAttributes {
  id: number;
  title: string;
  description: string;
  date: Date;
  price: number;
  availableSeats: number;
  teamId: number;
  stadiumId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventCreationAttributes extends Omit<EventAttributes, 'id'> {}

export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public date!: Date;
  public price!: number;
  public availableSeats!: number;
  public teamId!: number;
  public stadiumId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public readonly bookings?: any[];
  public readonly team?: any;
  public readonly stadium?: any;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    stadiumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stadiums',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'events',
  }
); 