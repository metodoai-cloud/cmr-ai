import { AnalyticsService } from '../services/index.js';

async function main() {
  try {
    console.log('Testing AnalyticsService.getClientPanel()...');
    const result = await AnalyticsService.getClientPanel();
    console.log('Success! Clients count:', result.clients.length);
    console.log('Metrics:', JSON.stringify(result.metrics, null, 2));
    console.log('Sample client:', JSON.stringify(result.clients[0], null, 2));
  } catch (err: any) {
    console.error('FAILED with error:', err);
  }
}

main();
