import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UpiPayment from '@/components/payment/UpiPayment';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

const Payment = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  useEffect(() => {
    if (location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails);
      setIsLoading(false);
      return;
    }
    
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        navigate('/events');
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            event_title,
            amount,
            ticket_count,
            delivery_details (*)
          `)
          .eq('id', bookingId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setBookingDetails({
            eventTitle: data.event_title,
            amount: data.amount,
            ticketCount: data.ticket_count,
            deliveryDetails: data.delivery_details
          });
        } else {
          toast({
            title: "Booking not found",
            description: "Please try again or contact support",
            variant: "destructive"
          });
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast({
          title: "Error loading booking",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId, location.state, navigate]);

  const handleUtrSubmit = (utr: string) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/confirmation/${bookingId}`, {
        state: {
          utr,
          bookingDetails: {
            ...bookingDetails,
            bookingId
          }
        }
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center my-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              disabled={isProcessing}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <LanguageSwitcher />
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{t('payment.title')}</h1>
              <p className="text-gray-600">
                {t('payment.subtitle', { eventTitle: bookingDetails.eventTitle })}
              </p>
              
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{t('payment.totalAmount')}</p>
                    <p className="text-xl font-bold">₹{bookingDetails.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('payment.tickets')}</p>
                    <p className="font-medium">
                      {bookingDetails.ticketCount} {bookingDetails.ticketCount === 1 ? t('common.ticket') : t('common.tickets')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <UpiPayment 
              bookingId={bookingId || '0'}
              amount={bookingDetails.amount}
              onUtrSubmit={handleUtrSubmit}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
