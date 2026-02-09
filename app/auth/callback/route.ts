import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oajmlieiyerxsjdwqust.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ham1saWVpeWVyeHNqZHdxdXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjA3MDcsImV4cCI6MjA4NTg5NjcwN30.7hzdWu920vzFlT0HtQ5ENQIHXNkLVCC0R_TrcbgIMtM';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
  },
});

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(new URL(`/?error=exchange_error&details=${encodeURIComponent(exchangeError.message)}`, request.url));
    }

    if (data.session) {
      // Create redirect response with cookies
      const response = NextResponse.redirect(new URL('/?auth=success', request.url));
      
      // Set session cookies
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/?error=auth_error', request.url));
}
