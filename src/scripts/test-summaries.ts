import { AnalyticsService } from '../services/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const finance = await AnalyticsService.getFinanceSummary();
  console.log('📊 FINANCE SUMMARY:');
  console.log('Total Invoiced:', finance.total_invoiced);
  console.log('Total Collected:', finance.total_collected);
  console.log('Outstanding:', finance.outstanding);
  console.log('Net Cash:', finance.net_cash);

  const panel = await AnalyticsService.getClientPanel();
  console.log('\n👥 CLIENT PANEL METRICS:');
  console.log('Current cash:', panel.metrics.current_cash_formatted);
  console.log('Historical collected:', panel.metrics.historical_collected_formatted);
  console.log('Note:', panel.metrics.historical_collected_note);

  const protea = panel.clients.find(c => c.name.includes('Protea') || c.name.includes('Lechera'));
  console.log('\n🌾 AGRÍCOLA PROTEA:');
  console.log('Name:', protea?.name);
  console.log('Billing status:', protea?.billing_status);
  console.log('Stage:', protea?.stage);
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
