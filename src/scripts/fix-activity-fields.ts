import { supabase } from '../db/connection';

async function main() {
  const { data: tasks, error } = await supabase.from('activities').select('*').eq('type', 'task');
  if (error) {
    console.error('Error querying tasks:', error);
    return;
  }

  for (const t of tasks || []) {
    let desired = t.desired_outcome;
    let next = t.next_action;
    let modified = false;

    // 1. Desired outcome
    if (!desired && t.result) {
      const rLower = t.result.toLowerCase().trim();
      const isStatus = ['completada', 'completado', 'done', 'finalizada', 'hecha', 'en proceso', 'in progress', 'pendiente', 'pending'].includes(rLower);
      if (!isStatus && t.result.trim().length > 3) {
        desired = t.result.trim();
        modified = true;
      }
    }

    // 2. Next action
    if (t.notes) {
      const match = t.notes.match(/(?:siguiente paso|siguiente acci[oó]n)(?:\s+una vez completada)?:\s*([^.\n]+)/i);
      if (match && match[1]) {
        next = match[1].trim();
        modified = true;
      }
    }

    if (modified) {
      console.log(`Updating activity [${t.id}] - ${t.notes?.slice(0, 30)}...`);
      console.log(`  -> desired_outcome: ${desired}`);
      console.log(`  -> next_action: ${next}`);

      const { error: updateErr } = await supabase
        .from('activities')
        .update({ desired_outcome: desired, next_action: next })
        .eq('id', t.id);

      if (updateErr) {
        console.error('  Update error:', updateErr.message);
      }
    }
  }

  console.log('✅ Fix completed!');
}

main().catch(console.error);
