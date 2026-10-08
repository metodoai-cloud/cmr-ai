import { supabase } from '../db/connection.js';

const sortServices = (list: any[]) => {
  return [...list].sort((a: any, b: any) => {
    // 1. Si existe sort_order explícito
    if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
      return Number(a.sort_order) - Number(b.sort_order);
    }

    // 2. Si el nombre comienza con número (ej: "1. Diagnóstico", "2. 1 Auto", "3. 2 Auto", "4. 3 Auto", "5. Retainer")
    const matchA = (a.name || '').match(/^(\d+)[.\-)\s]/);
    const matchB = (b.name || '').match(/^(\d+)[.\-)\s]/);
    if (matchA && matchB) {
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      if (numA !== numB) return numA - numB;
    }
    if (matchA && !matchB) return -1;
    if (!matchA && matchB) return 1;

    // 3. Si la categoría tiene numeración
    const catA = a.category || '';
    const catB = b.category || '';
    if (catA && catB && catA !== catB) {
      const cmp = catA.localeCompare(catB, 'es', { numeric: true });
      if (cmp !== 0) return cmp;
    }

    // 4. Fallback: Orden natural por nombre con soporte numérico
    return (a.name || '').localeCompare(b.name || '', 'es', { numeric: true });
  });
};

async function test() {
  const { data } = await supabase.from('services').select('*');
  const pilar2 = (data || []).filter((s: any) => s.category?.includes('2') || s.name?.includes('Automatiz') || s.name?.includes('Diagnóstico'));
  const sorted = sortServices(pilar2);
  console.log('=== PILAR 2 ORDENADO ===');
  sorted.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.name}`);
  });
  process.exit(0);
}

test();
