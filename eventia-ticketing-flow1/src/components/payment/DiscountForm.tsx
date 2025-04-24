import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';

interface DiscountFormProps {
    amount: number;
    onDiscountApplied: (discountedAmount: number, discountCode: string) => void;
}

export const DiscountForm: React.FC<DiscountFormProps> = ({ amount, onDiscountApplied }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApplyDiscount = async () => {
        try {
            setLoading(true);
            
            const settings = await apiService.getPaymentSettings();
            
            if (!settings.discountCode || settings.discountCode !== code) {
                toast({
                    title: t('common.error'),
                    description: t('payment.invalidDiscountCode'),
                    variant: "destructive"
                });
                return;
            }

            if (!settings.isActive) {
                toast({
                    title: t('common.error'),
                    description: t('payment.discountInactive'),
                    variant: "destructive"
                });
                return;
            }

            const discountedAmount = Math.max(0, amount - (settings.discountAmount || 0));
            onDiscountApplied(discountedAmount, code);
            toast({
                title: t('common.success'),
                description: t('payment.discountApplied', {
                    amount: settings.discountAmount,
                    currency: '₹'
                })
            });
            
        } catch (error) {
            console.error('Error applying discount:', error);
            toast({
                title: t('common.error'),
                description: t('payment.discountErrorGeneric'),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex space-x-2">
            <Input
                placeholder={t('payment.enterDiscountCode')}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={20}
            />
            <Button
                onClick={handleApplyDiscount}
                disabled={loading || !code}
            >
                {loading ? t('common.processing') : t('payment.applyDiscount')}
            </Button>
        </div>
    );
}; 