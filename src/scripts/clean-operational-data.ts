import { supabase } from '../db/connection.js';

async function resetOperationalData() {
  console.log('🚀 Iniciando limpieza de datos operativos en la base de datos...\n');

  const tablesToClear = [
    { name: 'audit_logs', label: 'Logs de Auditoría' },
    { name: 'business_events', label: 'Eventos de Negocio' },
    { name: 'payments', label: 'Pagos' },
    { name: 'invoices', label: 'Facturas' },
    { name: 'expenses', label: 'Gastos' },
    { name: 'withdrawals', label: 'Retiros' },
    { name: 'taxes', label: 'Impuestos' },
    { name: 'subscriptions', label: 'Suscripciones' },
    { name: 'projects', label: 'Proyectos' },
    { name: 'activities', label: 'Actividades' },
    { name: 'opportunities', label: 'Oportunidades' },
    { name: 'leads', label: 'Leads' },
    { name: 'clients', label: 'Clientes' },
    { name: 'contacts', label: 'Contactos' },
    { name: 'companies', label: 'Empresas' },
    { name: 'vendors', label: 'Proveedores' },
    { name: 'hooks', label: 'Hooks de Marketing' },
    { name: 'campaigns', label: 'Campañas' },
  ];

  for (const table of tablesToClear) {
    process.stdout.write(`Vaciando ${table.label} (${table.name})... `);
    const { error, count } = await supabase
      .from(table.name)
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.log(`❌ ERROR: ${error.message}`);
    } else {
      console.log(`✅ ${count ?? 0} registros eliminados.`);
    }
  }

  console.log('\n--- VERIFICACIÓN FINAL DEL ESTADO DE LAS TABLAS ---');
  const allTables = [
    ...tablesToClear.map(t => t.name),
    'services',
    'users'
  ];

  for (const table of allTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`- ${table}: Error al verificar (${error.message})`);
    } else {
      console.log(`- ${table}: ${count} registros`);
    }
  }

  console.log('\n✨ ¡Base de datos limpia y lista para recibir los datos reales!');
}

resetOperationalData().catch(console.error);
