import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import apiService from '@/services/api';

// Form schema for discount validation
const discountSchema = z.object({
  code: z.string().min(3, "Discount code must be at least 3 characters"),
  amount: z.coerce.number().min(0, "Discount amount cannot be negative"),
  maxUses: z.coerce.number().min(1, "Maximum uses must be at least 1"),
  expiryDate: z.string().optional(),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

const AdminDiscountManagement = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [discounts, setDiscounts] = useState<any[]>([]);
  
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: '',
      amount: 0,
      maxUses: 1,
      expiryDate: '',
    }
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setIsLoading(true);
      const settings = await apiService.getPaymentSettings();
      setDiscounts([settings].filter(Boolean));
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        title: t('Error'),
        description: t('Failed to load discounts'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DiscountFormValues) => {
    try {
      setIsLoading(true);
      
      await apiService.updatePaymentSettings({
        discountCode: data.code,
        discountAmount: data.amount,
        isActive: true
      });
      
      toast({
        title: t('Success'),
        description: t('Discount created successfully')
      });
      
      form.reset();
      fetchDiscounts();
    } catch (error) {
      console.error('Error creating discount:', error);
      toast({
        title: t('Error'),
        description: t('Failed to create discount'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      
      await apiService.updatePaymentSettings({
        discountCode: undefined,
        discountAmount: 0,
        isActive: false
      });
      
      toast({
        title: t('Success'),
        description: t('Discount deleted successfully')
      });
      
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        title: t('Error'),
        description: t('Failed to delete discount'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t('Discount Management')}</h1>
            <p className="text-gray-600 mt-2">{t('Create and manage discount codes')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('Create Discount')}</CardTitle>
                <CardDescription>
                  {t('Add a new discount code')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Discount Code')}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SUMMER2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Discount Amount')}</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxUses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Maximum Uses')}</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Expiry Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('Creating...')}
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          {t('Create Discount')}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('Active Discounts')}</CardTitle>
                <CardDescription>
                  {t('Manage existing discount codes')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : discounts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {t('No active discounts')}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {discounts.map((discount) => (
                      <div
                        key={discount.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{discount.discountCode}</p>
                          <p className="text-sm text-gray-500">
                            {t('Amount')}: ₹{discount.discountAmount}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(discount.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDiscountManagement;
