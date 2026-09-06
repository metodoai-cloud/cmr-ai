import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const { data: inv } = await supabase.from('invoices').select('*').eq('invoice_number', '84');
  console.log('INVOICE 84:', JSON.stringify(inv, null, 2));

  const { data: pays } = await supabase.from('payments').select('*');
  console.log('PAYMENTS COUNT:', pays?.length);
  console.log('ALL PAYMENTS:', JSON.stringify(pays, null, 2));
}

check().catch(console.error);
