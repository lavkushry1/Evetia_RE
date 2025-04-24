import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import DeliveryForm from './DeliveryForm';
import { UpiPayment } from '../payment/UpiPayment';
import { usePaymentSettings } from '@/hooks/use-payment-settings';
import apiService from '@/services/api';

interface BookingTicket {
  category: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface BookingData {
  eventTitle: string;
  tickets: BookingTicket[];
  totalAmount: number;
  eventId: string;
}

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'delivery' | 'payment'>('delivery');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [bookingId, setBookingId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = usePaymentSettings();

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (!data) {
      navigate('/');
      return;
    }

    try {
      setBookingData(JSON.parse(data));
    } catch (error) {
      console.error('Error parsing booking data:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleDeliverySubmit = async (deliveryData: any) => {
    if (!bookingData) return;

    setIsLoading(true);

    try {
      // Create booking using the API service
      const booking = await apiService.createBooking({
        eventId: bookingData.eventId,
        quantity: bookingData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
        totalAmount: bookingData.totalAmount,
        status: 'pending',
        userId: 'current-user-id' // This should be replaced with the actual user ID
      });

      setBookingId(booking.id);
      setStep('payment');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: t('common.error'),
        description: t('booking.createError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUtrSubmit = async (utr: string) => {
    try {
      // Update booking status using the API service
      await apiService.updateRequestPaymentStatus(bookingId, {
        paymentStatus: 'COMPLETED',
        paymentMethod: 'UPI',
        paymentId: utr,
        paymentDate: new Date().toISOString()
      });

      // Clear booking data from session
      sessionStorage.removeItem('bookingData');

      // Navigate to confirmation page
      navigate(`/confirmation/${bookingId}`);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: t('common.error'),
        description: t('payment.utrSubmitError'),
        variant: "destructive"
      });
    }
  };

  if (!bookingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{bookingData.eventTitle}</CardTitle>
          <CardDescription>
            {t('booking.summary')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookingData.tickets.map((ticket, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {t('booking.ticketQuantity', {
                    quantity: ticket.quantity,
                    category: ticket.category
                  })}
                </span>
                <span>{t('common.currency', { amount: ticket.subtotal })}</span>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between font-bold">
              <span>{t('payment.totalAmount')}</span>
              <span>{t('common.currency', { amount: bookingData.totalAmount })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {step === 'delivery' ? (
        <DeliveryForm 
          onSubmit={handleDeliverySubmit}
          isLoading={isLoading}
        />
      ) : (
        <UpiPayment
          bookingId={bookingId}
          amount={bookingData.totalAmount}
          upiVPA={settings?.upiVpa || 'eventia@okicici'}
          eventTitle={bookingData.eventTitle}
          onUtrSubmit={handleUtrSubmit}
        />
      )}
    </div>
  );
};

export default CheckoutPage; 