
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConfirmationPage from '@/components/booking/ConfirmationPage';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Confirmation = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // In a real app, if state is missing, fetch the booking details from the API
  const { bookingDetails = {} } = location.state || {};
  
  // Default values in case state is missing
  const {
    eventTitle = 'Event Title',
    eventDate = '2025-05-15',
    eventTime = '19:30',
    venue = 'Venue Name',
    ticketCount = 1
  } = bookingDetails;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center my-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/events')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.backToEvents')}
            </Button>
            <LanguageSwitcher />
          </div>
          
          <ConfirmationPage 
            bookingId={bookingId || '0'}
            eventTitle={eventTitle}
            eventDate={eventDate}
            eventTime={eventTime}
            venue={venue}
            ticketCount={ticketCount}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Confirmation;
