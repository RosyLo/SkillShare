import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
   // 讀取環境變數，不要在程式碼裡寫死任何金鑰
   const clientId = process.env.GOOGLE_CLIENT_ID;
   const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
   
   // 加上這個檢查，確保環境變數有成功讀取
   if (!clientId || !clientSecret) {
     console.error('Missing Google OAuth credentials in .env.local');
     return NextResponse.redirect(new URL('/?error=missing_credentials', request.url));
   }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'http://localhost:3000/api/auth/callback/google',
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokens);
      return NextResponse.redirect(new URL(`/?error=token_error&details=${encodeURIComponent(JSON.stringify(tokens))}`, request.url));
    }

    if (!tokens.access_token) {
      console.error('No access token received:', tokens);
      return NextResponse.redirect(new URL('/?error=token_error', request.url));
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Create a response that sets the user data in a cookie or returns it
    const response = NextResponse.redirect(new URL('/?auth=success', request.url));
    
    // Store user data in a cookie
    response.cookies.set('user', JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
    }), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_error', request.url));
  }
}
