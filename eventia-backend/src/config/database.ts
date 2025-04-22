import { DataSource } from 'typeorm';
import { User } from '../models/user.model';
import { Team } from '../models/team.model';
import { Event } from '../models/event.model';
import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { Discount } from '../models/discount.model';
import { Stadium } from '../models/stadium.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'theta-anchor-445617-s5:us-central1:eventia',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Lodu@735671',
  database: process.env.DB_NAME || 'eventia',
  synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in development
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Team, Event, Booking, Payment, Discount, Stadium],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA
  } : false,
  extra: {
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
  }
});

export const connectDB = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('PostgreSQL Connected...');
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
    process.exit(1);
  }
}; 