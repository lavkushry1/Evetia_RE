import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/hooks/useForm';
import { z } from 'zod';

interface DeliveryFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const deliverySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters')
});

const DeliveryForm: React.FC<DeliveryFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation();
  
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    isValid
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    validationSchema: deliverySchema,
    onSubmit
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('booking.deliveryDetails')}</CardTitle>
        <CardDescription>
          {t('booking.deliveryDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('booking.form.name')}
            </label>
            <Input
              name="name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder={t('booking.form.namePlaceholder')}
              aria-invalid={touched.name && errors.name ? 'true' : 'false'}
              className={touched.name && errors.name ? 'border-red-500' : ''}
            />
            {touched.name && errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {t('booking.form.nameError')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('booking.form.email')}
            </label>
            <Input
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder={t('booking.form.emailPlaceholder')}
              aria-invalid={touched.email && errors.email ? 'true' : 'false'}
              className={touched.email && errors.email ? 'border-red-500' : ''}
            />
            {touched.email && errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {t('booking.form.emailError')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('booking.form.phone')}
            </label>
            <Input
              name="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder={t('booking.form.phonePlaceholder')}
              aria-invalid={touched.phone && errors.phone ? 'true' : 'false'}
              className={touched.phone && errors.phone ? 'border-red-500' : ''}
            />
            {touched.phone && errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {t('booking.form.phoneError')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('booking.form.address')}
            </label>
            <Input
              name="address"
              value={values.address}
              onChange={(e) => handleChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              placeholder={t('booking.form.addressPlaceholder')}
              aria-invalid={touched.address && errors.address ? 'true' : 'false'}
              className={touched.address && errors.address ? 'border-red-500' : ''}
            />
            {touched.address && errors.address && (
              <p className="text-sm text-red-500 mt-1">
                {t('booking.form.addressError')}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isValid || isLoading}
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('common.processing')}
              </>
            ) : (
              t('booking.form.submit')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryForm; 