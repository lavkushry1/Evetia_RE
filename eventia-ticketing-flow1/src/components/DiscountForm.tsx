import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';

interface DiscountFormProps {
  onDiscountApplied: (discountAmount: number, finalAmount: number) => void;
  totalAmount: number;
}

export const DiscountForm: React.FC<DiscountFormProps> = ({
  onDiscountApplied,
  totalAmount,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyDiscount = async () => {
    if (!code.trim()) {
      toast({
        title: t('payment.discountError'),
        description: t('payment.enterDiscountCode'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          amount: totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      onDiscountApplied(data.discountAmount, data.finalAmount);
      toast({
        title: t('payment.discountSuccess'),
        description: t('payment.discountApplied', {
          amount: data.discountAmount,
          currency: '₹',
        }),
      });
    } catch (error) {
      toast({
        title: t('payment.discountError'),
        description: error instanceof Error ? error.message : t('payment.discountErrorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder={t('payment.enterDiscountCode')}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1"
        />
        <Button
          onClick={handleApplyDiscount}
          disabled={isLoading || !code.trim()}
          variant="outline"
        >
          {isLoading ? t('common.processing') : t('payment.applyDiscount')}
        </Button>
      </div>
    </div>
  );
}; 