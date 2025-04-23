import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, message } from 'antd';
import { createClient } from '@supabase/supabase-js';

interface DiscountFormProps {
    amount: number;
    onDiscountApplied: (discountedAmount: number, discountCode: string) => void;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const DiscountForm: React.FC<DiscountFormProps> = ({ amount, onDiscountApplied }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApplyDiscount = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('discounts')
                .select('*')
                .eq('code', code)
                .single();

            if (error) throw error;

            if (!data) {
                message.error(t('payment.invalidDiscountCode'));
                return;
            }

            if (!data.isActive) {
                message.error(t('payment.discountInactive'));
                return;
            }

            if (data.usesCount >= data.maxUses) {
                message.error(t('payment.discountExhausted'));
                return;
            }

            if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
                message.error(t('payment.discountExpired'));
                return;
            }

            const discountedAmount = Math.max(0, amount - data.amount);
            onDiscountApplied(discountedAmount, code);
            message.success(t('payment.discountApplied'));
            
        } catch (error) {
            console.error('Error applying discount:', error);
            message.error(t('payment.discountError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="discount-form">
            <Input
                placeholder={t('payment.enterDiscountCode')}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={20}
            />
            <Button
                type="primary"
                onClick={handleApplyDiscount}
                loading={loading}
                disabled={!code}
            >
                {t('payment.applyDiscount')}
            </Button>
        </div>
    );
}; 