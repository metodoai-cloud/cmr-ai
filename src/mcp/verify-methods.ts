import { OpportunityService, PaymentService, AnalyticsService, WithdrawalService, TaxService } from '../services/index.js';

console.log('OpportunityService.closeWon:', typeof OpportunityService.closeWon);
console.log('OpportunityService.closeLost:', typeof OpportunityService.closeLost);
console.log('PaymentService.create:', typeof PaymentService.create);
console.log('WithdrawalService.create:', typeof WithdrawalService.create);
console.log('TaxService.create:', typeof TaxService.create);
console.log('AnalyticsService.getSalesStats:', typeof AnalyticsService.getSalesStats);
