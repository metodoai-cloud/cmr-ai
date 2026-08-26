import { supabase } from '../db/connection.js';

async function main() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), payments(id, payment_date, amount)')
    .order('issue_date', { ascending: false });

  console.log('Query Error:', error);
  console.log('Results count:', data?.length);
  if (data && data.length > 0) {
    console.log('First Invoice:', {
      number: data[0].invoice_number,
      company: data[0].clients?.companies?.name,
      contact: data[0].clients?.contacts?.first_name,
      payments: data[0].payments
    });
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
