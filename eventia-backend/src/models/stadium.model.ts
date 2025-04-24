import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Event } from './event.model';

export interface StadiumAttributes {
  id: number;
  name: string;
  location: string;
  capacity: number;
  image?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StadiumCreationAttributes extends Omit<StadiumAttributes, 'id'> {}

export class Stadium extends Model<StadiumAttributes, StadiumCreationAttributes> implements StadiumAttributes {
  public id!: number;
  public name!: string;
  public location!: string;
  public capacity!: number;
  public image!: string;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public readonly events?: Event[];
}

Stadium.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'stadiums',
  }
); 