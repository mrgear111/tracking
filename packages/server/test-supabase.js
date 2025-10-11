import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseServiceKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\nTesting users table...');
    // Test connection by trying to select from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error connecting to Supabase:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('\n⚠️  This usually means the tables do not exist yet.');
      console.error('👉 Please create the tables in Supabase dashboard using the SQL provided.');
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Found users:', data);
    }

    // Also test pull_requests table
    const { data: prData, error: prError } = await supabase
      .from('pull_requests')
      .select('*')
      .limit(1);

    if (prError) {
      console.error('\n❌ Error accessing pull_requests table:');
      console.error('Error:', prError.message);
    } else {
      console.log('✅ pull_requests table is accessible!');
      console.log('Found PRs:', prData);
    }

  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

testConnection();
