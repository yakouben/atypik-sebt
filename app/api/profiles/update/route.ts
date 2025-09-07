import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 ===== DÉBUT API PROFILES UPDATE =====');
    console.log('🔍 Méthode HTTP:', request.method);
    console.log('🔍 URL:', request.url);
    console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()));
    
    // Parse request body first
    let requestBody;
    try {
      const rawBody = await request.text();
      console.log('🔍 Corps brut de la requête:', rawBody);
      
      requestBody = JSON.parse(rawBody);
      console.log('🔍 Corps parsé:', requestBody);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Corps de requête JSON invalide' },
        { status: 400 }
      );
    }
    
    const { user_id, full_name, email } = requestBody;
    
    console.log('🔍 ===== VALIDATION DES DONNÉES =====');
    console.log('🔍 user_id reçu:', user_id);
    console.log('🔍 full_name reçu:', full_name);
    console.log('🔍 email reçu:', email);
    console.log('🔍 Type de user_id:', typeof user_id);
    console.log('🔍 user_id est null?', user_id === null);
    console.log('🔍 user_id est undefined?', user_id === undefined);
    console.log('🔍 user_id est vide?', user_id === '');
    
    // Validate input
    if (!user_id || !full_name || !email) {
      console.error('❌ Validation échouée:');
      console.error('❌ user_id valide?', !!user_id);
      console.error('❌ full_name valide?', !!full_name);
      console.error('❌ email valide?', !!email);
      
      return NextResponse.json(
        { 
          error: 'Tous les champs sont requis',
          details: {
            user_id: user_id ? 'présent' : 'manquant',
            full_name: full_name ? 'présent' : 'manquant',
            email: email ? 'présent' : 'manquant'
          }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Try to refresh the session if there are cookie issues
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.log('⚠️ Erreur de session, tentative de rafraîchissement:', sessionError);
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.log('⚠️ Impossible de rafraîchir la session:', refreshError);
        } else {
          console.log('✅ Session rafraîchie avec succès');
        }
      } else {
        console.log('✅ Session valide trouvée:', session?.user?.id);
      }
    } catch (sessionError) {
      console.log('⚠️ Erreur lors de la vérification de la session:', sessionError);
    }
    
    // Try to verify user exists in profiles table (same as useAuth.ts)
    console.log('🔍 ===== VÉRIFICATION BASE DE DONNÉES =====');
    console.log('🔍 Table utilisée: profiles');
    console.log('🔍 ID recherché:', user_id);
    console.log('🔍 Type de l\'ID:', typeof user_id);
    
    // First, let's see what tables exist and what's in the profiles table
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('⚠️ Impossible de lister les tables:', tablesError);
    } else {
      console.log('🔍 Tables disponibles:', tables?.map(t => t.table_name));
      
      // Check if there are any tables with "profile" in the name
      const profileTables = tables?.filter(t => 
        t.table_name.toLowerCase().includes('profile') || 
        t.table_name.toLowerCase().includes('user')
      );
      console.log('🔍 Tables contenant "profile" ou "user":', profileTables);
      
      // Let's check each potential profile table for your user ID
      if (profileTables) {
        for (const table of profileTables) {
          console.log(`🔍 Vérification de la table: ${table.table_name}`);
          
          try {
            const { data: tableData, error: tableError } = await supabase
              .from(table.table_name)
              .select('*')
              .limit(3);
            
            if (tableError) {
              console.log(`⚠️ Erreur avec ${table.table_name}:`, tableError);
            } else {
              console.log(`🔍 Données dans ${table.table_name}:`, tableData);
              
              // Check if this table has your user ID
              if (tableData && tableData.length > 0) {
                const hasUserId = tableData.some(row => 
                  row.id === user_id || 
                  row.user_id === user_id || 
                  row.uid === user_id
                );
                console.log(`🔍 ${table.table_name} contient votre ID?`, hasUserId);
              }
            }
          } catch (error) {
            console.log(`⚠️ Impossible d'accéder à ${table.table_name}:`, error);
          }
        }
      }
    }
    
    // Check if profiles table has any data
    const { count: profileCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('⚠️ Erreur lors du comptage des profils:', countError);
    } else {
      console.log('🔍 Nombre total de profils dans la table profiles:', profileCount);
    }
    
    // Also check user_profiles table
    const { count: userProfileCount, error: userProfileCountError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (userProfileCountError) {
      console.log('⚠️ Erreur lors du comptage des user_profiles:', userProfileCountError);
    } else {
      console.log('🔍 Nombre total de profils dans la table user_profiles:', userProfileCount);
    }
    
    // Check if your user ID exists in user_profiles
    if (userProfileCount && userProfileCount > 0) {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('user_id, email, full_name')
        .eq('user_id', user_id)
        .single();
      
      if (userProfileError) {
        console.log('⚠️ Erreur lors de la recherche dans user_profiles:', userProfileError);
      } else {
        console.log('🔍 Votre profil trouvé dans user_profiles:', userProfileData);
      }
    }
    
    // Try to find the specific profile
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user_id)
      .single();
    
    console.log('🔍 Résultat de la recherche:', { existingProfile, profileCheckError });
    
    if (profileCheckError) {
      console.error('❌ Erreur lors de la vérification du profil:', profileCheckError);
      console.error('❌ Code d\'erreur:', profileCheckError.code);
      console.error('❌ Message d\'erreur:', profileCheckError.message);
      console.error('❌ Détails:', profileCheckError.details);
      
      // Let's try to see what's actually in the profiles table
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .limit(5);
      
      if (allProfilesError) {
        console.log('⚠️ Impossible de récupérer les profils:', allProfilesError);
      } else {
        console.log('🔍 Premiers 5 profils dans la table:', allProfiles);
      }
      
      return NextResponse.json(
        { 
          error: 'Profil utilisateur non trouvé',
          debug: {
            searched_id: user_id,
            table_name: 'profiles',
            profile_count: profileCount,
            sample_profiles: allProfiles
          }
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Profil utilisateur vérifié:', existingProfile);
    console.log('🔍 ===== FIN VÉRIFICATION BASE DE DONNÉES =====');

    // Check if email is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .neq('id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la vérification de l\'email:', checkError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de l\'email' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé par un autre utilisateur' },
        { status: 409 }
      );
    }

    // Try to update profile using SQL function first
    let updateError = null;
    try {
      const { data: updateResult, error: rpcError } = await supabase
        .rpc('update_user_profile', {
          user_id_param: user_id,
          new_full_name: full_name,
          new_email: email
        });

      if (rpcError) {
        console.log('⚠️ Fonction SQL non disponible, utilisation de la méthode directe');
        updateError = rpcError;
      } else {
        console.log('✅ Profil mis à jour via fonction SQL');
      }
    } catch (error) {
      console.log('⚠️ Erreur avec fonction SQL, utilisation de la méthode directe');
      updateError = error;
    }

    // Fallback: direct update if SQL function fails
    if (updateError) {
      console.log('🔄 Tentative de mise à jour directe...');
      const { error: directUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: full_name,
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id);

      if (directUpdateError) {
        console.error('❌ Erreur lors de la mise à jour directe:', directUpdateError);
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil' },
          { status: 500 }
        );
      }
      
      console.log('✅ Profil mis à jour via méthode directe');
    }

    // Get updated profile
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .select()
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil mis à jour:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil mis à jour' },
        { status: 500 }
      );
    }

    // Note: Email update in auth.users is skipped due to session issues
    // The profile data is updated successfully in the database
    console.log('ℹ️ Mise à jour de l\'email dans auth.users ignorée (problèmes de session)');

    console.log('✅ Profil mis à jour avec succès:', updatedProfile);

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedProfile
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
