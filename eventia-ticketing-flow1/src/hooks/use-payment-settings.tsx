import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import payments from '@/services/api';

// Define the type to match what the API returns
export interface PaymentSettings {
  upiVpa: string;
  merchantName: string;
  discountCode?: string;
  discountAmount?: number;
  isActive: boolean;
  updatedAt: string;
}

export const usePaymentSettings = (shouldRefresh: boolean = false) => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to manually trigger a refresh
  const refreshSettings = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await payments.getPaymentSettings();
        
        if (data) {
          setSettings({
            ...data,
            updatedAt: (data as any).updatedAt || new Date().toISOString()
          });
        } else {
          // Use default values if no settings are found
          setSettings({
            upiVpa: 'default@upi',
            merchantName: 'Default Merchant',
            isActive: true,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err: any) {
        console.error('Error fetching payment settings:', err);
        setError(err);
        
        // Fall back to default settings
        setSettings({
          upiVpa: 'default@upi',
          merchantName: 'Default Merchant',
          isActive: true,
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
  }, [refreshTrigger]);

  return { settings, isLoading, error, refreshSettings };
};
