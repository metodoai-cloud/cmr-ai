import { ActivityService } from '../services/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    console.log('Testing ActivityService.create:');
    const act = await ActivityService.create({
      type: 'note',
      notes: 'Test note from script',
    });
    console.log('Created:', act);
  } catch (err) {
    console.error('Direct error:', err);
  }
}

test();
