import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { UpiPayment } from '@/components/payment/UpiPayment';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { DiscountForm } from '@/components/payment/DiscountForm';
import apiService from '@/services/api';

const Payment = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [upiSettings, setUpiSettings] = useState<any>(null);
  
  useEffect(() => {
    if (location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails);
      setFinalAmount(location.state.bookingDetails.amount);
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
        
        const booking = await apiService.getBooking(bookingId);
        
        if (booking) {
          setBookingDetails({
            eventTitle: booking.eventId,
            amount: booking.totalAmount,
            ticketCount: booking.quantity,
            status: booking.status
          });
          setFinalAmount(booking.totalAmount);
        } else {
          toast({
            title: t('common.error'),
            description: t('payment.bookingNotFound'),
            variant: "destructive"
          });
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast({
          title: t('common.error'),
          description: t('payment.loadingError'),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId, location.state, navigate, t]);

  useEffect(() => {
    fetchUpiSettings();
  }, []);

  const fetchUpiSettings = async () => {
    try {
      const settings = await apiService.getPaymentSettings();
      setUpiSettings(settings);
    } catch (error) {
      console.error('Error fetching UPI settings:', error);
    }
  };

  const handleDiscountApplied = (newAmount: number, code: string) => {
    setDiscountAmount(newAmount);
    setDiscountCode(code);
    setFinalAmount(newAmount);
  };

  const handleUtrSubmit = async (utr: string): Promise<void> => {
    setIsProcessing(true);
    
    try {
      await apiService.submitUtr(bookingId!, utr);
      navigate(`/confirmation/${bookingId}`, {
        state: {
          utr,
          bookingDetails: {
            ...bookingDetails,
            bookingId,
            discountAmount,
            finalAmount,
            discountCode
          }
        }
      });
    } catch (error) {
      console.error('Error submitting UTR:', error);
      toast({
        title: t('common.error'),
        description: t('payment.utrSubmitError'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
                    {discountAmount > 0 && (
                      <>
                        <p className="text-sm text-green-600 mt-2">{t('payment.discountApplied')}</p>
                        <p className="text-lg font-bold text-green-600">
                          -₹{discountAmount.toLocaleString('en-IN')}
                        </p>
                      </>
                    )}
                    <p className="text-sm text-gray-500 mt-2">{t('payment.finalAmount')}</p>
                    <p className="text-xl font-bold">
                      ₹{finalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('payment.tickets')}</p>
                    <p className="font-medium">
                      {bookingDetails.ticketCount} {bookingDetails.ticketCount === 1 ? t('common.ticket') : t('common.tickets')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <DiscountForm
                  amount={bookingDetails.amount}
                  onDiscountApplied={handleDiscountApplied}
                />
              </div>
            </div>
            
            {upiSettings && (
              <UpiPayment 
                bookingId={bookingId || '0'}
                amount={finalAmount}
                upiVPA={upiSettings.upiVpa}
                eventTitle={bookingDetails.eventTitle}
                onUtrSubmit={handleUtrSubmit}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
