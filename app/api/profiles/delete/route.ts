import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Parse request body
    const { user_id } = await request.json();

    // Validate input
    if (!user_id) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Check if user is deleting their own profile
    if (user.id !== user_id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez supprimer que votre propre profil' },
        { status: 403 }
      );
    }

    // Create admin client for user deletion
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Start a transaction to delete all related data
    const { error: transactionError } = await supabase.rpc('delete_user_profile', {
      user_id_param: user_id
    });

    if (transactionError) {
      console.error('Erreur lors de la suppression du profil:', transactionError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du profil' },
        { status: 500 }
      );
    }

    // Delete the user from Supabase Auth using admin client
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    
    if (authDeleteError) {
      console.error('Erreur lors de la suppression de l\'utilisateur Auth:', authDeleteError);
      // Don't fail the request - the profile was deleted successfully
      // The user will still be logged out and can create a new account
    } else {
      console.log('✅ Utilisateur supprimé de Supabase Auth avec succès');
    }

    console.log('✅ Profil supprimé avec succès pour l\'utilisateur:', user_id);

    return NextResponse.json({
      success: true,
      message: 'Profil supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
