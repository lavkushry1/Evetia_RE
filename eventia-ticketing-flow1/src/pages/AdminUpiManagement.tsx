import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Copy, CreditCard, Shield, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';
import { QRCodeGenerator } from '@/components/payment/QRCodeGenerator';
import { usePaymentSettings } from '@/hooks/use-payment-settings';

// Form schema for UPI VPA validation
const upiSchema = z.object({
  merchantName: z.string().min(3, "Merchant name must be at least 3 characters"),
  vpa: z.string()
    .min(5, "UPI VPA must be at least 5 characters")
    .regex(/^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/, "Invalid UPI VPA format (e.g., example@bank)"),
  discountCode: z.string().optional(),
  discountAmount: z.coerce.number().min(0, "Discount cannot be negative").optional(),
  description: z.string().optional(),
});

type UpiFormValues = z.infer<typeof upiSchema>;

const AdminUpiManagement = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Initialize Supabase client with error handling
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Check if Supabase credentials are available
  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      setConfigError('Supabase configuration is missing. Please connect your project to Supabase first.');
    } else {
      setConfigError(null);
    }
  }, [supabaseUrl, supabaseKey]);
  
  // Only create the client when credentials are available
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
  
  // Get current payment settings with modified hook that handles missing Supabase config
  const { settings, isLoading, error, refreshSettings } = usePaymentSettings();
  
  const form = useForm<UpiFormValues>({
    resolver: zodResolver(upiSchema),
    defaultValues: {
      merchantName: 'Eventia Tickets',
      vpa: '',
      discountCode: '',
      discountAmount: 0,
      description: 'Official payment account for Eventia ticket purchases',
    }
  });

  // When settings are loaded, update the form
  useEffect(() => {
    if (settings) {
      form.reset({
        merchantName: 'Eventia Tickets',
        vpa: settings.upiVPA,
        discountCode: settings.discountCode || '',
        discountAmount: settings.discountAmount || 0,
        description: 'Official payment account for Eventia ticket purchases',
      });
      
      setLastUpdated(new Date(settings.updatedAt).toLocaleString());
    }
  }, [settings, form]);

  const onSubmit = async (data: UpiFormValues) => {
    if (!supabase) {
      toast({
        title: "Supabase configuration missing",
        description: "Please connect your project to Supabase first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real application, this would update the UPI details in the database
      const { error } = await supabase
        .from('payment_settings')
        .insert({
          upi_vpa: data.vpa,
          merchant_name: data.merchantName,
          discount_code: data.discountCode || null,
          discount_amount: data.discountAmount || 0,
          description: data.description || null,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "UPI details updated",
        description: "Your UPI VPA has been successfully updated.",
      });
      
      setLastUpdated(new Date().toLocaleString());
      refreshSettings();
    } catch (err) {
      console.error('Error updating UPI settings:', err);
      toast({
        title: "Error updating settings",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    const vpa = form.getValues('vpa');
    navigator.clipboard.writeText(vpa);
    setIsCopied(true);
    toast({
      title: "UPI VPA copied",
      description: "UPI VPA has been copied to clipboard.",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const refreshQR = () => {
    setIsRefreshing(true);
    refreshSettings();
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "QR Code refreshed",
        description: "The QR code has been regenerated with the current UPI VPA.",
      });
    }, 1000);
  };

  if (configError) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 pt-16 pb-12 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Configuration Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{configError}</p>
              <p className="text-sm text-gray-600 mb-4">
                To use this feature, you need to connect your Lovable project to Supabase:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 mb-4">
                <li>Click the green Supabase button in the top right corner</li>
                <li>Follow the connection steps</li>
                <li>Once connected, refresh this page</li>
              </ol>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 pt-16 pb-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">UPI Payment Settings</h1>
            <p className="text-gray-600 mt-1">Manage your UPI Virtual Payment Address (VPA) for ticket transactions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    UPI VPA Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="merchantName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Merchant Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Eventia Tickets" {...field} />
                            </FormControl>
                            <FormDescription>
                              This name will appear in users' UPI payment apps
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="vpa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UPI VPA</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <Input placeholder="e.g., business@bank" {...field} className="rounded-r-none" />
                              </FormControl>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="rounded-l-none"
                                onClick={copyToClipboard}
                              >
                                {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <FormDescription>
                              The Virtual Payment Address that will receive payments (e.g., name@bank)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="discountCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Code</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., WELCOME50" {...field} />
                              </FormControl>
                              <FormDescription>
                                Current active discount code
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="discountAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Amount (₹)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="e.g., 50" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Amount to discount from total
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Official payment account for tickets" {...field} />
                            </FormControl>
                            <FormDescription>
                              Additional information about this payment address
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end pt-2">
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    UPI QR Code Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {form.getValues('vpa') ? (
                    <div className="mb-4">
                      <QRCodeGenerator 
                        upiVPA={form.getValues('vpa')}
                        amount={100}
                        eventTitle={form.getValues('merchantName')}
                        transactionNote="Sample Transaction"
                      />
                    </div>
                  ) : (
                    <div className="border-4 border-primary/20 w-32 h-32 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <p className="text-xs text-gray-500">Enter UPI VPA first</p>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mb-2"
                    onClick={refreshQR}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-2" />
                    )}
                    Refresh QR Code
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {lastUpdated}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminUpiManagement;
