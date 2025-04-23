import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import DeliveryForm from './DeliveryForm';
import { UpiPayment } from '../payment/UpiPayment';
import { usePaymentSettings } from '@/hooks/use-payment-settings';

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
}

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'delivery' | 'payment'>('delivery');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [bookingId, setBookingId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = usePaymentSettings();

  // Initialize Supabase client
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

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
      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          event_title: bookingData.eventTitle,
          total_amount: bookingData.totalAmount,
          status: 'pending',
          customer_name: deliveryData.fullName,
          customer_email: deliveryData.email,
          customer_phone: deliveryData.phone,
          delivery_address: deliveryData.address,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create ticket records
      const ticketPromises = bookingData.tickets.map(ticket =>
        supabase.from('tickets').insert({
          booking_id: booking.id,
          category: ticket.category,
          quantity: ticket.quantity,
          price: ticket.price,
          subtotal: ticket.subtotal
        })
      );

      await Promise.all(ticketPromises);

      setBookingId(booking.id);
      setStep('payment');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: t('Error'),
        description: t('Failed to process booking. Please try again.'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUtrSubmit = async (utr: string) => {
    try {
      // Update booking status
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'payment_pending' })
        .eq('id', bookingId);

      if (error) throw error;

      // Clear booking data from session
      sessionStorage.removeItem('bookingData');

      // Navigate to confirmation page
      navigate(`/confirmation/${bookingId}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: t('Error'),
        description: t('Failed to update booking status'),
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
            {t('Order Summary')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookingData.tickets.map((ticket, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {ticket.quantity}x {ticket.category}
                </span>
                <span>₹{ticket.subtotal}</span>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between font-bold">
              <span>{t('Total Amount')}</span>
              <span>₹{bookingData.totalAmount}</span>
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
          upiVPA={settings?.upiVPA || 'eventia@okicici'}
          eventTitle={bookingData.eventTitle}
          onUtrSubmit={handleUtrSubmit}
        />
      )}
    </div>
  );
};

export default CheckoutPage; 