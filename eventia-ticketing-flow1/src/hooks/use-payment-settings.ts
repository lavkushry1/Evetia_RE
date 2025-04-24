import { useState, useEffect } from 'react';
import apiService from '@/services/api';

interface PaymentSettings {
  upiVpa: string;
  merchantName: string;
  discountCode?: string;
  discountAmount?: number;
  isActive: boolean;
}

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getPaymentSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch payment settings'));
      
      // Provide fallback data in case of error
      setSettings({
        upiVpa: 'eventia@okicici',
        merchantName: 'Eventia Tickets',
        isActive: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, isLoading, error, refreshSettings };
}