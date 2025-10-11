import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use node-fetch instead of native fetch to avoid undici issues
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    fetch: fetch
  }
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.log('Users table creation result:', usersError);
    }

    // Create pull_requests table if it doesn't exist
    const { error: prsError } = await supabase.rpc('create_pull_requests_table');
    if (prsError && !prsError.message.includes('already exists')) {
      console.log('Pull requests table creation result:', prsError);
    }

    console.log('Database tables initialized');
  } catch (error) {
    console.warn('Database initialization warning:', error.message);
  }
}

export async function createTablesManually() {
  // We'll create tables manually using raw SQL since RPC might not be available
  try {
    // Create users table
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('Creating users table...');
      // Table doesn't exist, we'll need to create it via dashboard or SQL
    }

    // Create pull_requests table
    const { error: prsError } = await supabase
      .from('pull_requests')
      .select('id')
      .limit(1);
    
    if (prsError && prsError.code === 'PGRST116') {
      console.log('Creating pull_requests table...');
      // Table doesn't exist, we'll need to create it via dashboard or SQL
    }
  } catch (error) {
    console.log('Tables may need to be created manually in Supabase dashboard');
  }
}