import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from './LoadingSpinner';

interface FormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  description,
  children,
  isLoading = false,
  error,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        {error && (
          <p 
            className="text-sm text-red-600 mt-2" 
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div 
            className="min-h-[200px] flex items-center justify-center"
            aria-label="Loading"
          >
            <LoadingSpinner />
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit}
            noValidate
            aria-label={title}
          >
            {children}
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export { FormWrapper };
export type { FormWrapperProps }; 