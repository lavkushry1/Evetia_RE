import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const deliveryFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a complete address'),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => void;
  isLoading?: boolean;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const handleSubmit = (data: DeliveryFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Delivery Information')}</CardTitle>
        <CardDescription>
          {t('Please provide your details for ticket delivery')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Full Name')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('Enter your full name')} 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Email Address')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder={t('Enter your email address')} 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Phone Number')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder={t('Enter your phone number')} 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Delivery Address')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('Enter your complete address')} 
                      {...field} 
                      disabled={isLoading}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('Processing...') : t('Proceed to Payment')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeliveryForm; 