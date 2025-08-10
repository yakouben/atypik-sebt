import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { token, type } = await request.json();

    // Create server-side Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    console.log('Email confirmation request:', { token: token ? 'present' : 'missing', type });

    if (!token) {
      return NextResponse.json(
        { error: 'Code de confirmation manquant' },
        { status: 400 }
      );
    }

    // For Supabase email confirmation, we need to use the correct method
    let user = null;
    let error = null;
    let isAlreadyConfirmed = false;

    try {
      // Method 1: Try to exchange the code for a session (most common for email confirmation)
      console.log('Trying exchangeCodeForSession...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(token);
      
      if (!exchangeError && data?.user) {
        user = data.user;
        console.log('User verified successfully with exchangeCodeForSession:', user.id);
      } else {
        error = exchangeError;
        console.log('exchangeCodeForSession failed:', exchangeError);
        
        // Check if the error is because the email is already confirmed
        if (exchangeError?.message?.includes('already confirmed') || 
            exchangeError?.message?.includes('already verified') ||
            exchangeError?.message?.includes('invalid') ||
            exchangeError?.message?.includes('expired')) {
          isAlreadyConfirmed = true;
          console.log('Email appears to be already confirmed, checking user status...');
        }
      }
    } catch (e) {
      console.log('exchangeCodeForSession threw exception:', e);
      error = e;
    }

    // If email is already confirmed or we have an error, try to get the user from the current session
    if (isAlreadyConfirmed || (!user && error)) {
      console.log('Attempting to get user from current session...');
      const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();
      
      if (currentUser && !sessionError) {
        user = currentUser;
        isAlreadyConfirmed = true;
        console.log('Found user from current session:', user.id);
      } else {
        // If we can't get the user from session, try to extract user info from the token
        // This is a fallback for cases where the token is valid but already used
        console.log('Attempting to decode token to get user info...');
        
        // For now, we'll return a success response if the error suggests the email is already confirmed
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error as { message: string }).message 
          : '';
        
        if (isAlreadyConfirmed || 
            errorMessage.includes('already') || 
            errorMessage.includes('invalid') ||
            errorMessage.includes('expired')) {
          return NextResponse.json(
            { 
            success: true,
              message: 'Email déjà confirmé ou lien expiré',
              isAlreadyConfirmed: true 
            },
            { status: 200 }
          );
        }
      }
    }

    if (!user && !isAlreadyConfirmed) {
      console.error('All email confirmation methods failed:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la confirmation de l\'email. Veuillez vérifier le lien dans votre email.' },
        { status: 400 }
      );
    }

    // Ensure user is not null before proceeding
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 400 }
      );
    }

    // Get the user profile to determine redirect
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // If no profile exists, we'll create it later when the user logs in
      // For now, return success with default user type from metadata
      const userType = user.user_metadata?.user_type || 'client';
      console.log('No profile found, using default user type:', userType);
      return NextResponse.json({
        success: true,
        user_type: userType,
        redirect_to: userType === 'owner' ? '/dashboard/owner' : '/dashboard/client',
        message: isAlreadyConfirmed ? 'Email déjà confirmé avec succès' : 'Email confirmé avec succès'
      });
    }

    const userType = profile?.user_type || 'client';
    console.log('User type determined from profile:', userType);

    return NextResponse.json({
      success: true,
      user_type: userType,
      redirect_to: userType === 'owner' ? '/dashboard/owner' : '/dashboard/client',
      message: isAlreadyConfirmed ? 'Email déjà confirmé avec succès' : 'Email confirmé avec succès'
    });

  } catch (error) {
    console.error('Email confirmation API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 