import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

// Import models
import { User } from './user.model';
import { Booking } from './booking.model';
import { Event } from './event.model';
import { Stadium } from './stadium.model';
import { Team } from './team.model';
import { Discount } from './discount.model';
import { Admin } from './admin.model';
import { Payment } from './payment.model';
import { Settings } from './settings.model';

// Define associations
export function defineAssociations() {
  // User-Booking associations
  User.hasMany(Booking, { foreignKey: 'userId' });
  Booking.belongsTo(User, { foreignKey: 'userId' });

  // Event-Booking associations
  Event.hasMany(Booking, { foreignKey: 'eventId' });
  Booking.belongsTo(Event, { foreignKey: 'eventId' });

  // Stadium-Event associations
  Stadium.hasMany(Event, { foreignKey: 'stadiumId' });
  Event.belongsTo(Stadium, { foreignKey: 'stadiumId' });

  // Team-Event associations
  Team.hasMany(Event, { foreignKey: 'teamId' });
  Event.belongsTo(Team, { foreignKey: 'teamId' });

  // Booking-Payment associations
  Booking.hasOne(Payment, { foreignKey: 'bookingId' });
  Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

  // User-Payment associations
  User.hasMany(Payment, { foreignKey: 'userId' });
  Payment.belongsTo(User, { foreignKey: 'userId' });
}

// Initialize associations
defineAssociations();

export {
  sequelize,
  Sequelize,
  User,
  Booking,
  Event,
  Stadium,
  Team,
  Discount,
  Admin,
  Payment,
  Settings,
}; 