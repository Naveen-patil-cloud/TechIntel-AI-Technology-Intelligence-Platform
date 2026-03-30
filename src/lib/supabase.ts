import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oqymfcnmcnshxhsrduiy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xeW1mY25tY25zaHhoc3JkdWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTk3ODAsImV4cCI6MjA5MDI5NTc4MH0.O44Ns9VH3IsO0QHyR_alL55IHAy908bx3KfNg7CnCV8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
