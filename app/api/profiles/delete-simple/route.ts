import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function DELETE(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    console.log('🗑️ Suppression du profil et de l\'utilisateur pour ID:', user_id);

    // 1. Delete profile from profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id);

    if (profileError) {
      console.error('❌ Erreur suppression profil:', profileError);
      return NextResponse.json({ error: 'Erreur lors de la suppression du profil' }, { status: 500 });
    }

    console.log('✅ Profil supprimé avec succès');

    // 2. Delete user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (authError) {
      console.error('❌ Erreur suppression auth:', authError);
      return NextResponse.json({ error: 'Erreur lors de la suppression de l\'utilisateur Auth' }, { status: 500 });
    }

    console.log('✅ Utilisateur supprimé de Supabase Auth avec succès');

    return NextResponse.json({ 
      success: true, 
      message: 'Compte supprimé complètement' 
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression du compte' 
    }, { status: 500 });
  }
}
