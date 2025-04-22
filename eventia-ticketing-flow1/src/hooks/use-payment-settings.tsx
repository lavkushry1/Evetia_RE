
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface PaymentSettings {
  upiVPA: string;
  discountCode: string | null;
  discountAmount: number | null;
  updatedAt: string;
}

export const usePaymentSettings = (shouldRefresh: boolean = false) => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize Supabase client with check for valid config
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Create client only if configuration exists
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  // Function to manually trigger a refresh
  const refreshSettings = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Skip fetch if Supabase is not configured
    if (!supabase) {
      setSettings({
        upiVPA: 'default@upi',
        discountCode: null,
        discountAmount: 0,
        updatedAt: new Date().toISOString()
      });
      setIsLoading(false);
      return;
    }
    
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the latest payment settings
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSettings({
            upiVPA: data.upi_vpa,
            discountCode: data.discount_code,
            discountAmount: data.discount_amount,
            updatedAt: data.updated_at
          });
        } else {
          // Use default values if no settings are found
          setSettings({
            upiVPA: 'default@upi',
            discountCode: null,
            discountAmount: 0,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err: any) {
        console.error('Error fetching payment settings:', err);
        setError(err);
        
        // Fall back to default settings
        setSettings({
          upiVPA: 'default@upi',
          discountCode: null,
          discountAmount: 0,
          updatedAt: new Date().toISOString()
        });
        
        toast({
          title: "Error loading payment settings",
          description: "Using default settings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
    
    // Set up real-time subscription if shouldRefresh is true and Supabase is configured
    if (shouldRefresh && supabase) {
      const subscription = supabase
        .channel('payment_settings_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'payment_settings' }, 
          (payload) => {
            // Refresh settings on any change
            refreshSettings();
          }
        )
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [refreshTrigger, shouldRefresh, supabase]);
  
  return { settings, isLoading, error, refreshSettings };
};
