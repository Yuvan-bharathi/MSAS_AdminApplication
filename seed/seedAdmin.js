import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

// Default values if you don't pass arguments
const EMAIL = process.argv[2] || 'yuvan22@gmail.com';
const PASSWORD = process.argv[3] || '1234567890';
const CLIENT_ID = 'CLT0001'; // Default client

async function seedAdmin() {
  console.log('--- STARTING ADMIN SEEDING ---');
  console.log(`Creating Admin User: ${EMAIL}`);

  try {
    // 1. Create user in Supabase Auth (This requires either the UI or the Admin API)
    // Since we are using standard supabase client here (anon key), we can just sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: EMAIL,
      password: PASSWORD,
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('User already exists in Supabase Auth, attempting to log in to get ID...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: EMAIL,
          password: PASSWORD,
        });
        
        if (loginError) throw loginError;
        
        await createAdminRecord(loginData.user.id);
      } else {
        throw authError;
      }
    } else if (authData.user) {
      await createAdminRecord(authData.user.id);
    }
    
    console.log('--- SEEDING SUCCESSFUL ---');
  } catch (error) {
    console.error('--- SEEDING FAILED ---', error);
  }
}

async function createAdminRecord(authUserId) {
    console.log(`Creating adminUsers record for auth user: ${authUserId}`);
    
    const { error } = await supabase
        .from('adminUsers')
        .upsert({
            adminId: `ADM${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            clientId: CLIENT_ID,
            authUserId: authUserId,
            email: EMAIL,
            name: 'Yuvanbharathi',
            role: 'Admin'
        }, { onConflict: 'email' });

    if (error) throw error;
    console.log('Admin record successfully created/updated in database.');
}

seedAdmin();
