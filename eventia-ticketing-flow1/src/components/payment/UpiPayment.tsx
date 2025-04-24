import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { QRCodeGenerator } from './QRCodeGenerator';
import apiService from '@/services/api';

interface UpiPaymentProps {
    bookingId: string;
    amount: number;
    upiVPA: string;
    eventTitle: string;
    onUtrSubmit: (utr: string) => Promise<void>;
}

// Validation functions
const isValidUTR = (utr: string): boolean => {
    const UTR_REGEX = /^[A-Za-z0-9]{10,20}$/;
    return UTR_REGEX.test(utr.trim());
};

const formatTransactionNote = (bookingId: string): string => {
    return `Booking ID: ${bookingId}`;
};

export const UpiPayment: React.FC<UpiPaymentProps> = ({
    bookingId,
    amount,
    upiVPA,
    eventTitle,
    onUtrSubmit
}) => {
    const { t } = useTranslation();
    const [utr, setUtr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Convert to uppercase and remove spaces
        setUtr(e.target.value.toUpperCase().replace(/\s+/g, ''));
    };

    const validateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isValidUTR(utr)) {
            toast({
                title: t('common.error'),
                description: t('payment.invalidUTR'),
                variant: "destructive"
            });
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await apiService.submitUtr(bookingId, utr);
            await onUtrSubmit(utr);
        } catch (error: any) {
            console.error('Error submitting UTR:', error);
            toast({
                title: t('common.error'),
                description: error.message || t('payment.utrSubmitError'),
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderQRSection = () => (
        <>
            <div className="flex justify-center">
                <QRCodeGenerator
                    upiVPA={upiVPA}
                    amount={amount}
                    eventTitle={eventTitle}
                    transactionNote={formatTransactionNote(bookingId)}
                />
            </div>
            
            <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('payment.scanQR')}
                </p>
                <p className="font-mono text-sm">
                    {t('payment.merchantVPA')}: {upiVPA}
                </p>
                <p className="font-semibold">
                    {t('payment.totalAmount')}: ₹{amount}
                </p>
            </div>
        </>
    );

    const renderUtrForm = () => (
        <form onSubmit={validateAndSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('payment.submitUTR')}
                </label>
                <Input
                    type="text"
                    value={utr}
                    onChange={handleUtrChange}
                    placeholder={t('payment.utrPlaceholder')}
                    className="font-mono uppercase"
                    maxLength={20}
                    disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('payment.utrDescription')}
                </p>
            </div>
            
            <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !utr.trim()}
            >
                {isSubmitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t('common.processing')}
                    </>
                ) : (
                    t('payment.confirmPayment')
                )}
            </Button>
        </form>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('payment.upiPayment')}</CardTitle>
                <CardDescription>
                    {t('payment.scanQR')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {renderQRSection()}
                    {renderUtrForm()}
                </div>
            </CardContent>
        </Card>
    );
};
