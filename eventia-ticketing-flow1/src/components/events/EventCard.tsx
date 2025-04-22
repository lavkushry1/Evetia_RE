
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Clock, Users, Tag } from 'lucide-react';
import { Event } from '@/data/eventsData';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const { t } = useTranslation();
  
  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate if the event is upcoming (within 7 days)
  const isUpcoming = () => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const diffTime = Math.abs(eventDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return eventDate >= today && diffDays <= 7;
  };

  // Calculate if the event is selling fast (less than 20% tickets available)
  const isSellingFast = () => {
    const totalAvailable = event.ticketTypes.reduce((sum, ticket) => sum + ticket.available, 0);
    const totalCapacity = event.ticketTypes.reduce((sum, ticket) => sum + ticket.capacity, 0);
    return (totalAvailable / totalCapacity) < 0.2;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
      <div className="relative overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between">
          <Badge className="bg-white/90 text-primary hover:bg-white/80">
            {t(`categories.${event.category.toLowerCase().replace(/ & /g, 'And')}`)}
          </Badge>
          
          <div className="flex gap-1">
            {isUpcoming() && (
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                {t('events.upcoming')}
              </Badge>
            )}
            {isSellingFast() && (
              <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                {t('events.sellingFast')}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        
        <div className="text-gray-600 mb-4 line-clamp-2 text-sm">
          {event.description}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-primary/70" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-primary/70" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-primary/70" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="h-4 w-4 mr-2 text-primary/70" />
            <span>{event.duration}</span>
          </div>
        </div>
        
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <span className="text-sm text-gray-600">{t('events.startingFrom')}</span>
            <div className="font-bold text-lg">
              ₹{Math.min(...event.ticketTypes.map(t => t.price))}
            </div>
          </div>
          <Link to={`/event/${event.id}`}>
            <AnimatedButton size="sm">{t('common.bookNow')}</AnimatedButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
