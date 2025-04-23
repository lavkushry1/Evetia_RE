import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeGenerator } from './QRCodeGenerator';
import { createClient } from '@supabase/supabase-js';

interface UpiPaymentProps {
    bookingId: string;
    amount: number;
    upiVPA: string;
    eventTitle?: string;
    discountCode?: string;
    onUtrSubmit: (utr: string) => void;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const UpiPayment: React.FC<UpiPaymentProps> = ({
    bookingId,
    amount,
    upiVPA,
    eventTitle,
    discountCode,
    onUtrSubmit
}) => {
    const { t } = useTranslation();
    const [utr, setUtr] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Update booking payment status
            const { error: bookingError } = await supabase
                .from('booking_payments')
                .insert({
                    booking_id: bookingId,
                    amount: amount,
                    utr_number: utr,
                    status: 'pending',
                    payment_date: new Date().toISOString()
                });

            if (bookingError) throw bookingError;

            // If discount was applied, increment its usage
            if (discountCode) {
                const { error: discountError } = await supabase
                    .rpc('increment_discount_usage', { discount_code: discountCode });

                if (discountError) throw discountError;
            }

            onUtrSubmit(utr);
            message.success(t('payment.utrSubmitted', 'UTR submitted successfully'));
        } catch (error) {
            console.error('Error submitting UTR:', error);
            message.error(t('payment.utrError', 'Error submitting UTR'));
        } finally {
            setLoading(false);
        }
    };

    const transactionNote = `${eventTitle || 'Eventia'} Booking #${bookingId}`;

    return (
        <div className="upi-payment">
            <QRCodeGenerator
                upiVPA={upiVPA}
                amount={amount}
                eventTitle={eventTitle}
                transactionNote={transactionNote}
            />
            
            <div className="utr-form mt-6">
                <Input
                    placeholder={t('payment.enterUTR', 'Enter UTR Number')}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.toUpperCase())}
                    maxLength={12}
                    className="font-mono"
                />
                <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={!utr || utr.length < 12 || loading}
                    className="mt-4"
                >
                    {loading ? t('payment.processing', 'Processing...') : t('payment.submitUTR', 'Submit UTR')}
                </Button>
            </div>
        </div>
    );
};
