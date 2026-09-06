import fs from 'fs';
import path from 'path';
import { supabase } from '../db/connection.js';

async function run() {
  console.log('🚀 Executing Strategic Layer migration...');
  const migrationPath = path.join(process.cwd(), 'src/db/migrations/02_strategic_layer.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Attempt RPC first
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.log('⚠️ RPC exec_sql is not available directly on Supabase REST:', error.message);
    console.log('📌 If exec_sql is not enabled, the SQL must be executed via Supabase SQL Editor.');
    console.log('📄 SQL file ready at: src/db/migrations/02_strategic_layer.sql');
  } else {
    console.log('✅ Migration executed successfully via RPC!');
  }
}

run().catch(console.error);
