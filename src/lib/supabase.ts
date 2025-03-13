import { createClient } from '@supabase/supabase-js';
import { FunctionsError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function handleSupabaseError(error: unknown): Error {
  if (error instanceof FunctionsHttpError) {
    return new Error(`API Error: ${error.message}`);
  }
  
  if (error instanceof FunctionsRelayError) {
    return new Error('Failed to connect to payment service. Please try again.');
  }
  
  if (error instanceof FunctionsError) {
    return new Error(`Payment service error: ${error.message}`);
  }
  
  if (error instanceof Error) {
    return error;
  }
  
  return new Error('An unexpected error occurred');
}