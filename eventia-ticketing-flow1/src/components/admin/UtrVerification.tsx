import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiService from '@/services/api';

interface PaymentTransaction {
  id: string;
  booking_id: string;
  utr_number: string;
  amount: number;
  status: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
  discount_code?: string;
  discount_amount?: number;
}

const UtrVerification: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await apiService.getRequests({ type: 'payment' });
      setTransactions(response.requests || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: t('Error'),
        description: t('Failed to load transactions'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (id: string, status: 'verified' | 'rejected') => {
    setProcessingId(id);

    try {
      if (status === 'verified') {
        await apiService.approveRequest(id);
      } else {
        await apiService.rejectRequest(id);
      }

      toast({
        title: t('Success'),
        description: t('Transaction status updated successfully')
      });
      
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: t('Error'),
        description: t('Failed to update transaction status'),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('UTR Verification')}</CardTitle>
        <CardDescription>
          {t('Verify payment transactions and manage ticket generation')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Booking ID')}</TableHead>
              <TableHead>{t('UTR Number')}</TableHead>
              <TableHead>{t('Amount')}</TableHead>
              <TableHead>{t('Status')}</TableHead>
              <TableHead>{t('Created At')}</TableHead>
              <TableHead>{t('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono">
                  {transaction.booking_id}
                </TableCell>
                <TableCell className="font-mono">
                  {transaction.utr_number}
                </TableCell>
                <TableCell>
                  ₹{transaction.amount}
                  {transaction.discount_amount && transaction.discount_amount > 0 && (
                    <span className="text-sm text-green-600 ml-2">
                      (-₹{transaction.discount_amount})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    transaction.verification_status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : transaction.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {transaction.verification_status === 'verified' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {transaction.verification_status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                    {transaction.verification_status === 'pending' && <AlertCircle className="mr-1 h-3 w-3" />}
                    {t(transaction.verification_status)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(transaction.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {transaction.verification_status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleVerification(transaction.id, 'verified')}
                        disabled={processingId === transaction.id}
                      >
                        {processingId === transaction.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerification(transaction.id, 'rejected')}
                        disabled={processingId === transaction.id}
                      >
                        {processingId === transaction.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UtrVerification; 