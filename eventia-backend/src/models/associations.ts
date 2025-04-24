import { Event } from './event.model';
import { Team } from './team.model';
import { Stadium } from './stadium.model';
import { Booking } from './booking.model';
import { User } from './user.model';

// Event associations
Event.hasMany(Booking, { foreignKey: 'eventId' });
Event.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Event.belongsTo(Stadium, { foreignKey: 'stadiumId', as: 'stadium' });

// Team associations
Team.hasMany(Event, { foreignKey: 'teamId', as: 'events' });

// Stadium associations
Stadium.hasMany(Event, { foreignKey: 'stadiumId', as: 'events' });

// Booking associations
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' }); 