// This is a migration file to help transition from Supabase to the API service
import { createSupabaseClient } from '@/utils/supabase-migration';

// Create a mock Supabase client that redirects to the API service
export const supabase = createSupabaseClient(); 