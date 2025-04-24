import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void>;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const validateField = useCallback(
    (name: keyof T, value: any) => {
      if (!validationSchema) return '';

      try {
        if (validationSchema instanceof z.ZodObject) {
          validationSchema.shape[name].parse(value);
        } else {
          validationSchema.parse(value);
        }
        return '';
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || '';
        }
        return '';
      }
    },
    [validationSchema]
  );

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      const error = validateField(name, value);
      
      setFormState((prev) => ({
        ...prev,
        values: { ...prev.values, [name]: value },
        errors: { ...prev.errors, [name]: error },
        touched: { ...prev.touched, [name]: true },
        isValid: !error && Object.values(prev.errors).every((err) => !err),
      }));
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      const error = validateField(name, formState.values[name]);
      
      setFormState((prev) => ({
        ...prev,
        touched: { ...prev.touched, [name]: true },
        errors: { ...prev.errors, [name]: error },
        isValid: !error && Object.values(prev.errors).every((err) => !err),
      }));
    },
    [formState.values, validateField]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validationSchema) {
        setFormState((prev) => ({ ...prev, isSubmitting: true }));
        await onSubmit(formState.values);
        setFormState((prev) => ({ ...prev, isSubmitting: false }));
        return;
      }

      try {
        const validatedData = validationSchema.parse(formState.values);
        setFormState((prev) => ({ ...prev, isSubmitting: true }));
        await onSubmit(validatedData);
        setFormState((prev) => ({ ...prev, isSubmitting: false }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.reduce((acc, curr) => {
            const path = curr.path[0] as keyof T;
            acc[path] = curr.message;
            return acc;
          }, {} as Record<keyof T, string>);

          setFormState((prev) => ({
            ...prev,
            errors,
            isValid: false,
            isSubmitting: false,
          }));
        }
      }
    },
    [formState.values, onSubmit, validationSchema]
  );

  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
} 