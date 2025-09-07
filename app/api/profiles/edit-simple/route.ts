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

export async function PUT(request: NextRequest) {
  try {
    const { user_id, full_name, email } = await request.json();
    
    if (!user_id || !full_name || !email) {
      return NextResponse.json({ 
        error: 'user_id, full_name, and email are required' 
      }, { status: 400 });
    }

    console.log('✏️ ===== DÉBUT MISE À JOUR =====');
    console.log('✏️ user_id:', user_id);
    console.log('✏️ Nouveau nom:', full_name);
    console.log('✏️ Nouvel email:', email);
    console.log('✏️ Type user_id:', typeof user_id);
    console.log('✏️ Longueur user_id:', user_id.length);

    // 1. Update profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: full_name,
        email: email,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (profileError) {
      console.error('❌ Erreur mise à jour profil:', profileError);
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour du profil' 
      }, { status: 500 });
    }

    console.log('✅ Profil mis à jour avec succès dans la table profiles');

    // 2. Update email AND display name in Supabase Auth (without requiring email confirmation)
    console.log('✏️ Tentative de mise à jour de l\'email ET du nom d\'affichage dans Supabase Auth...');
    
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { 
          email: email,
          email_confirm: true,  // This confirms the email without sending verification
          user_metadata: {       // This updates the display name
            full_name: full_name
          }
        }
      );

      if (authError) {
        console.error('❌ Erreur mise à jour auth:', authError);
        console.error('❌ Code d\'erreur:', authError.status);
        console.error('❌ Message d\'erreur:', authError.message);
        
        // Try alternative approach: direct SQL update to auth.users
        console.log('🔄 Tentative d\'approche alternative: mise à jour directe SQL...');
        
        const { error: sqlError } = await supabaseAdmin.rpc('update_auth_user_email_and_name', {
          user_uuid: user_id,
          new_email: email,
          new_full_name: full_name
        });
        
        if (sqlError) {
          console.error('❌ Erreur SQL alternative:', sqlError);
          return NextResponse.json({ 
            error: 'Erreur lors de la mise à jour de l\'email dans l\'authentification (approches multiples échouées)'
          }, { status: 500 });
        }
        
        console.log('✅ Email ET nom d\'affichage mis à jour via SQL alternatif avec succès');
      } else {
        console.log('✅ Email ET nom d\'affichage mis à jour dans Supabase Auth avec succès');
        console.log('✅ Données auth mises à jour:', authData);
      }
    } catch (authException) {
      console.error('❌ Exception lors de la mise à jour auth:', authException);
      
      // Try alternative approach: direct SQL update to auth.users
      console.log('🔄 Tentative d\'approche alternative: mise à jour directe SQL...');
      
      const { error: sqlError } = await supabaseAdmin.rpc('update_auth_user_email_and_name', {
        user_uuid: user_id,
        new_email: email,
        new_full_name: full_name
      });
      
      if (sqlError) {
        console.error('❌ Erreur SQL alternative:', sqlError);
        return NextResponse.json({ 
          error: 'Erreur lors de la mise à jour de l\'email dans l\'authentification (approches multiples échouées)'
        }, { status: 500 });
      }
      
              console.log('✅ Email ET nom d\'affichage mis à jour via SQL alternatif avec succès');
    }
    console.log('✏️ ===== FIN MISE À JOUR =====');

    return NextResponse.json({ 
      success: true, 
      message: 'Profil, email ET nom d\'affichage mis à jour complètement' 
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du profil' 
    }, { status: 500 });
  }
}
