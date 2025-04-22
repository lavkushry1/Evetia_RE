
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCodeGenerator from './QRCodeGenerator';
import { usePaymentSettings } from '@/hooks/use-payment-settings';
import { createClient } from '@supabase/supabase-js';  // Add this import

interface UpiPaymentProps {
  bookingId: string;
  amount: number;
  onUtrSubmit: (utr: string) => void;
}

const UpiPayment: React.FC<UpiPaymentProps> = ({ bookingId, amount, onUtrSubmit }) => {
  const { t } = useTranslation();
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if Supabase configuration exists
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isMissingConfig = !supabaseUrl || !supabaseKey;
  
  // Fetch payment settings with real-time updates enabled
  const { settings, isLoading, error } = usePaymentSettings(true);
  
  // Apply discount if available
  const calculateDiscountedAmount = () => {
    if (settings?.discountAmount && settings.discountAmount > 0) {
      return Math.max(0, amount - settings.discountAmount);
    }
    return amount;
  };
  
  const finalAmount = calculateDiscountedAmount();
  const transactionNote = `Eventia-${bookingId}`;

  const handleUtrSubmit = () => {
    if (!utrNumber.trim()) {
      toast({
        title: t('payment.utrRequired'),
        description: t('payment.utrDescription'),
        variant: "destructive"
      });
      return;
    }

    // If Supabase is not configured, we'll just call the callback
    if (isMissingConfig) {
      toast({
        title: "Demo Mode",
        description: "In a real app, this would save data to the database."
      });
      
      setIsSubmitting(true);
      
      setTimeout(() => {
        setIsSubmitting(false);
        onUtrSubmit(utrNumber);
      }, 1000);
      
      return;
    }

    setIsSubmitting(true);
    
    // In a real application, this would call the Supabase function
    const saveUtr = async () => {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error } = await supabase
          .from('booking_payments')
          .insert({
            booking_id: bookingId,
            utr_number: utrNumber,
            amount: finalAmount,
            status: 'pending',
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        // Call the callback
        onUtrSubmit(utrNumber);
        
      } catch (error) {
        console.error('Error saving UTR:', error);
        toast({
          title: "Error processing payment",
          description: "Please try again or contact support",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    };
    
    saveUtr();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isMissingConfig) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('payment.demoMode')}
          </CardTitle>
          <CardDescription>
            {t('payment.configurationMissing')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 p-4 rounded-md mb-4">
            <p className="text-sm text-amber-800">
              This is a preview mode. In a real application, payments would be processed through Supabase.
            </p>
          </div>
          
          <QRCodeGenerator 
            upiVPA="demo@example"
            amount={finalAmount}
            payeeName="Demo Mode"
            transactionNote={transactionNote}
          />
          
          <div className="mt-6">
            <label className="block font-medium mb-2">{t('payment.enterUtr')}</label>
            <Input
              placeholder="UTR Number (Demo Mode)"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="font-mono mb-2"
            />
            <Button 
              className="w-full" 
              onClick={handleUtrSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                t('payment.processing') : 
                t('payment.submitUtr')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !settings) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{t('payment.errorLoading')}</p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('payment.upiPayment')}</CardTitle>
          <CardDescription>
            {t('payment.scanQrOrPayManually')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="bg-gray-50 p-4 rounded-md flex justify-center">
            <QRCodeGenerator 
              upiVPA={settings.upiVPA}
              amount={finalAmount}
              payeeName="Eventia Tickets"
              transactionNote={transactionNote}
            />
          </div>
          
          {/* Discount information if applicable */}
          {settings.discountAmount && settings.discountAmount > 0 && (
            <div className="bg-green-50 p-3 rounded-md border border-green-100">
              <p className="text-green-700 text-sm font-medium">
                {t('payment.discountApplied')}: ₹{settings.discountAmount}
              </p>
              <div className="flex justify-between mt-1 text-sm">
                <span className="text-gray-600">{t('payment.originalAmount')}</span>
                <span className="text-gray-600">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mt-1 font-medium">
                <span>{t('payment.finalAmount')}</span>
                <span>₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
          
          {/* Payment amounts */}
          {(!settings.discountAmount || settings.discountAmount === 0) && (
            <div>
              <p className="text-sm text-gray-500">{t('payment.amount')}</p>
              <p className="font-medium text-lg">₹{finalAmount.toLocaleString('en-IN')}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500">{t('payment.transactionNote')}</p>
            <p className="font-medium">{transactionNote}</p>
          </div>
          
          {/* UTR Input */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium mb-2">{t('payment.enterUtr')}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('payment.utrDescription')}
            </p>
            <div className="space-y-2">
              <Input
                placeholder="UTR Number (12-digit)"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="font-mono"
                maxLength={12}
              />
              <p className="text-xs text-gray-500">
                {t('payment.utrLocation')}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleUtrSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {t('payment.verifying')}
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4 mr-2" />
                {t('payment.submitUtr')}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UpiPayment;
