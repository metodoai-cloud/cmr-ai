import { supabase } from './connection.js';

async function test() {
  console.log('Testing Supabase connection...\n');

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .limit(3);

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', JSON.stringify(error, null, 2));
    return;
  }

  console.log('✅ Connection successful!');
  console.log('Users:', JSON.stringify(data, null, 2));

  // Test dashboard query
  const { data: opps, error: oppErr } = await supabase
    .from('opportunities')
    .select('id, name, stage, setup_value, recurring_value')
    .limit(5);

  if (oppErr) {
    console.error('❌ Opportunities error:', oppErr.message);
    return;
  }
  console.log('\nOpportunities:', JSON.stringify(opps, null, 2));
}

test().catch(console.error);
