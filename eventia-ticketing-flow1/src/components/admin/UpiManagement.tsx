import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface UpiSettings {
  id: string;
  upi_vpa: string;
  merchant_name: string;
  is_active: boolean;
  updated_at: string;
}

const UpiManagement: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UpiSettings | null>(null);
  const [upiVpa, setUpiVpa] = useState('');
  const [merchantName, setMerchantName] = useState('');

  // Initialize Supabase client
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Validate UPI VPA format
  const validateUpiVpa = (vpa: string): boolean => {
    const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return UPI_REGEX.test(vpa);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setUpiVpa(data.upi_vpa);
        setMerchantName(data.merchant_name);
      }
    } catch (error) {
      console.error('Error fetching UPI settings:', error);
      toast({
        title: t('Error'),
        description: t('Failed to load UPI settings'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUpiVpa(upiVpa)) {
      toast({
        title: t('Error'),
        description: t('Please enter a valid UPI VPA'),
        variant: "destructive"
      });
      return;
    }

    if (!merchantName.trim()) {
      toast({
        title: t('Error'),
        description: t('Please enter merchant name'),
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Deactivate current active settings
      if (settings?.id) {
        await supabase
          .from('payment_settings')
          .update({ is_active: false })
          .eq('id', settings.id);
      }

      // Insert new settings
      const { error } = await supabase.from('payment_settings').insert({
        upi_vpa: upiVpa,
        merchant_name: merchantName,
        is_active: true,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: t('Success'),
        description: t('UPI settings updated successfully')
      });

      await fetchSettings();
    } catch (error) {
      console.error('Error updating UPI settings:', error);
      toast({
        title: t('Error'),
        description: t('Failed to update UPI settings'),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
        <CardTitle>{t('UPI Payment Settings')}</CardTitle>
        <CardDescription>
          {t('Manage your UPI Virtual Payment Address (VPA) and merchant details')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('UPI VPA')}
            </label>
            <Input
              type="text"
              value={upiVpa}
              onChange={(e) => setUpiVpa(e.target.value)}
              placeholder="example@upi"
              required
              className="font-mono"
            />
            <p className="text-sm text-gray-500">
              {t('Enter your UPI Virtual Payment Address (e.g., merchant@bank)')}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('Merchant Name')}
            </label>
            <Input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Your Business Name"
              required
            />
            <p className="text-sm text-gray-500">
              {t('This name will be displayed to customers during payment')}
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSaving || !upiVpa || !merchantName}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('Saving...')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('Save Settings')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpiManagement; 