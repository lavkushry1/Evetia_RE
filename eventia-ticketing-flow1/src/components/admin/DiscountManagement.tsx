import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Discount {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
}

export const DiscountManagement: React.FC = () => {
  const { t } = useTranslation();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    maxUses: 0,
    startDate: '',
    endDate: '',
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/discounts/admin');
      if (!response.ok) throw new Error('Failed to fetch discounts');
      const data = await response.json();
      setDiscounts(data);
    } catch (error) {
      toast({
        title: t('admin.discountError'),
        description: t('admin.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscount = async () => {
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDiscount),
      });

      if (!response.ok) throw new Error('Failed to create discount');

      toast({
        title: t('admin.discountSuccess'),
        description: t('admin.discountCreated'),
      });

      fetchDiscounts();
      setNewDiscount({
        code: '',
        type: 'percentage',
        value: 0,
        maxUses: 0,
        startDate: '',
        endDate: '',
        minPurchaseAmount: 0,
        maxDiscountAmount: 0,
        isActive: true,
      });
    } catch (error) {
      toast({
        title: t('admin.discountError'),
        description: t('admin.createError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete discount');

      toast({
        title: t('admin.discountSuccess'),
        description: t('admin.discountDeleted'),
      });

      fetchDiscounts();
    } catch (error) {
      toast({
        title: t('admin.discountError'),
        description: t('admin.deleteError'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t('admin.createDiscount')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder={t('admin.discountCode')}
            value={newDiscount.code}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })
            }
          />
          <select
            value={newDiscount.type}
            onChange={(e) =>
              setNewDiscount({
                ...newDiscount,
                type: e.target.value as 'percentage' | 'fixed',
              })
            }
            className="border rounded p-2"
          >
            <option value="percentage">{t('admin.percentage')}</option>
            <option value="fixed">{t('admin.fixed')}</option>
          </select>
          <Input
            type="number"
            placeholder={t('admin.discountValue')}
            value={newDiscount.value}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, value: Number(e.target.value) })
            }
          />
          <Input
            type="number"
            placeholder={t('admin.maxUses')}
            value={newDiscount.maxUses}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, maxUses: Number(e.target.value) })
            }
          />
          <Input
            type="date"
            value={newDiscount.startDate}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, startDate: e.target.value })
            }
          />
          <Input
            type="date"
            value={newDiscount.endDate}
            onChange={(e) =>
              setNewDiscount({ ...newDiscount, endDate: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder={t('admin.minPurchaseAmount')}
            value={newDiscount.minPurchaseAmount}
            onChange={(e) =>
              setNewDiscount({
                ...newDiscount,
                minPurchaseAmount: Number(e.target.value),
              })
            }
          />
          <Input
            type="number"
            placeholder={t('admin.maxDiscountAmount')}
            value={newDiscount.maxDiscountAmount}
            onChange={(e) =>
              setNewDiscount({
                ...newDiscount,
                maxDiscountAmount: Number(e.target.value),
              })
            }
          />
        </div>
        <Button onClick={handleCreateDiscount}>{t('admin.createDiscount')}</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t('admin.existingDiscounts')}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.code')}</TableHead>
              <TableHead>{t('admin.type')}</TableHead>
              <TableHead>{t('admin.value')}</TableHead>
              <TableHead>{t('admin.uses')}</TableHead>
              <TableHead>{t('admin.validity')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead>{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount._id}>
                <TableCell>{discount.code}</TableCell>
                <TableCell>{t(`admin.${discount.type}`)}</TableCell>
                <TableCell>
                  {discount.type === 'percentage'
                    ? `${discount.value}%`
                    : `₹${discount.value}`}
                </TableCell>
                <TableCell>
                  {discount.currentUses} / {discount.maxUses}
                </TableCell>
                <TableCell>
                  {format(new Date(discount.startDate), 'dd/MM/yyyy')} -{' '}
                  {format(new Date(discount.endDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  {discount.isActive ? t('admin.active') : t('admin.inactive')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteDiscount(discount._id)}
                  >
                    {t('admin.delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};