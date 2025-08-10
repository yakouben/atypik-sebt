import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, user_type, address, what_you_own, reservation_type } = await request.json();

    // Create server-side Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    // Construct the redirect URL for email confirmation
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const emailRedirectTo = `${origin}/auth/confirm`;

    console.log('Email redirect URL:', emailRedirectTo);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Signup data:', { email, full_name, user_type });

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Configuration error - missing environment variables' }, { status: 500 });
    }

    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          user_type
        },
        emailRedirectTo: emailRedirectTo
      }
    });

    console.log('Auth signup result:', { 
      user: authData?.user?.id, 
      session: !!authData?.session, 
      error: authError?.message 
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      console.log('User created successfully:', authData.user.id);
      
      // Create profile in profiles table using admin client to bypass RLS
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          user_type,
          address: address || '',
          what_you_own: what_you_own || '',
          reservation_type: reservation_type || ''
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, we should still return success for auth
        return NextResponse.json({ 
          data: authData, 
          error: null,
          warning: 'Profile creation failed, will be created on first login'
        });
      }

      console.log('Profile created successfully');

      // Check if email confirmation was sent
      if (authData.session) {
        console.log('User signed in immediately (email confirmation might be disabled)');
        return NextResponse.json({ 
          data: authData, 
          error: null,
          message: 'Compte créé avec succès ! Vous êtes maintenant connecté.',
          requiresEmailConfirmation: false
        });
      } else {
        console.log('Email confirmation sent');
        return NextResponse.json({ 
          data: authData, 
          error: null,
          message: 'Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.',
          requiresEmailConfirmation: true
        });
      }
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 