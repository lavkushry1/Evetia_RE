
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';

const discountSchema = z.object({
  code: z.string().min(3, "Discount code must be at least 3 characters"),
  amount: z.coerce.number().min(1, "Discount amount must be greater than 0"),
  description: z.string().optional(),
  maxUses: z.coerce.number().min(1, "Maximum uses must be at least 1"),
  expiryDate: z.string().optional(),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

const AdminDiscountManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Initialize Supabase client with error handling
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: '',
      amount: 0,
      description: '',
      maxUses: 100,
      expiryDate: '',
    }
  });

  const onSubmit = async (data: DiscountFormValues) => {
    if (!supabase) {
      toast({
        title: "Configuration Error",
        description: "Please connect your project to Supabase first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('discounts')
        .insert({
          code: data.code.toUpperCase(),
          amount: data.amount,
          description: data.description,
          max_uses: data.maxUses,
          expiry_date: data.expiryDate || null,
          created_at: new Date().toISOString(),
          is_active: true,
          uses_count: 0
        });

      if (error) throw error;

      toast({
        title: "Discount Created",
        description: "The discount code has been created successfully.",
      });

      form.reset();
    } catch (error) {
      console.error('Error creating discount:', error);
      toast({
        title: "Error",
        description: "Failed to create discount code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!supabaseUrl || !supabaseKey) {
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
              <p className="mb-4">Supabase configuration is missing. Please connect your project to Supabase first.</p>
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
            <p className="text-gray-600 mt-1">Create and manage discount codes for your events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-primary" />
                  Create New Discount
                </CardTitle>
                <CardDescription>
                  Set up a new discount code for your events
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
                          <FormLabel>Discount Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SUMMER2025" {...field} />
                          </FormControl>
                          <FormDescription>
                            A unique code that customers will enter
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500" {...field} />
                          </FormControl>
                          <FormDescription>
                            Fixed amount to be discounted
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxUses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Uses</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            How many times this code can be used
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            When this discount code expires
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Description of the discount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Discount Code'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Discounts</CardTitle>
                <CardDescription>
                  Currently active discount codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* We'll implement the active discounts list later */}
                  <p className="text-sm text-gray-500">No active discounts</p>
                </div>
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
