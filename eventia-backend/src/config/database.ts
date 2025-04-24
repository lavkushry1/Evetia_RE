import { Sequelize } from 'sequelize';
import config from './index';

// Create Sequelize instance with configuration
export const sequelize = new Sequelize({
  dialect: config.database.dialect,
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  logging: config.env === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Connect to database
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    if (config.env === 'development') {
      // Use force: true to recreate tables with correct UUID support
      await sequelize.sync({ force: true });
      console.log('Database models synchronized successfully.');
    } else {
      // In production, we should use migrations instead of auto-sync
      console.log('Database models loaded successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}; 