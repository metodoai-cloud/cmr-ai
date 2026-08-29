import { ServiceCatalog } from '../services/index.js';

async function test() {
  const services = await ServiceCatalog.getAll();
  console.log(`Total services: ${services.length}`);
  services.forEach((s: any, idx: number) => {
    console.log(`${idx + 1}. [${s.category}] ${s.name} (Setup: $${s.standard_setup_price} | MRR: $${s.standard_recurring_price})`);
  });
  process.exit(0);
}

test();
