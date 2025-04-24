// This file contains utility functions to help migrate from Supabase to the API service
// It provides mock implementations of Supabase functions that redirect to the API service

import apiService from '@/services/api';

// Mock Supabase client for backward compatibility
export const createSupabaseClient = () => {
  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        try {
          const response = await apiService.login(email, password);
          return { data: { token: response.token }, error: null };
        } catch (error: any) {
          return { data: null, error };
        }
      },
      signOut: () => {
        apiService.logout();
        return { error: null };
      }
    },
    from: (table: string) => {
      return {
        select: (columns: string) => {
          return {
            eq: (column: string, value: any) => {
              return {
                single: async () => {
                  // Implement based on the table and query
                  switch (table) {
                    case 'admins':
                      // This would need to be implemented in the API
                      throw new Error('Admin verification needs to be implemented in the API');
                    case 'payment_settings':
                      try {
                        const settings = await apiService.getPaymentSettings();
                        return { data: settings, error: null };
                      } catch (error: any) {
                        return { data: null, error };
                      }
                    default:
                      throw new Error(`Table ${table} not implemented in migration`);
                  }
                }
              };
            },
            insert: async (data: any) => {
              // Implement based on the table
              switch (table) {
                case 'bookings':
                  try {
                    const booking = await apiService.createBooking(data);
                    return { data: booking, error: null };
                  } catch (error: any) {
                    return { data: null, error };
                  }
                default:
                  throw new Error(`Table ${table} not implemented in migration`);
              }
            },
            update: async (data: any) => {
              // Implement based on the table
              switch (table) {
                case 'payment_settings':
                  try {
                    const settings = await apiService.updatePaymentSettings(data);
                    return { data: settings, error: null };
                  } catch (error: any) {
                    return { data: null, error };
                  }
                default:
                  throw new Error(`Table ${table} not implemented in migration`);
              }
            }
          };
        }
      };
    }
  };
}; 