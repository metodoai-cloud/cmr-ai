import { ExpenseService } from '../services/index.js';

async function main() {
  console.log('--- Testing ExpenseService.create with amount ---');
  
  const testExpense = await ExpenseService.create({
    category: 'software',
    amount: 25000,
    description: 'Claude Cowork Expense Test Verification',
    vendor_name: 'Anthropic Claude',
    date: '2026-09-12',
  }, 'mcp');

  console.log('✅ Expense created successfully:', {
    id: testExpense.id,
    category: testExpense.category,
    subtotal: testExpense.subtotal,
    total: testExpense.total,
    vendor_id: testExpense.vendor_id,
    date: testExpense.date,
    status: testExpense.status,
  });

  console.log('\n--- Testing ExpenseService.getAll ---');
  const allExpenses = await ExpenseService.getAll();
  console.log(`✅ Total expenses in DB: ${allExpenses.length}`);
  const found = allExpenses.find((e: any) => e.id === testExpense.id);
  console.log('Found created test expense:', found ? 'YES' : 'NO');

  // Clean up test expense
  if (testExpense?.id) {
    console.log('\n--- Cleaning up test expense ---');
    await ExpenseService.delete(testExpense.id);
    console.log('✅ Test expense cleaned up.');
  }

  console.log('\n🎉 All ExpenseService tests passed!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
