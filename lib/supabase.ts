import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oajmlieiyerxsjdwqust.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ham1saWVpeWVyeHNqZHdxdXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjA3MDcsImV4cCI6MjA4NTg5NjcwN30.7hzdWu920vzFlT0HtQ5ENQIHXNkLVCC0R_TrcbgIMtM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
});
