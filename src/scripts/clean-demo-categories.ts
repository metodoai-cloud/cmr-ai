import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function cleanOldDemo() {
  const demoCategories = ['seo', 'web', 'social_media', 'email', 'automation'];
  const { data, error } = await supabase.from('services').update({ active: false }).in('category', demoCategories).select();
  console.log(`Desactivados ${data?.length} servicios demo antiguos:`, data?.map(d => d.name));
}

cleanOldDemo();
