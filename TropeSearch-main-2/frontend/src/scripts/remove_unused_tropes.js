import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../../.env');

dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure .env file has VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeUnusedTropes() {
  console.log('Starting unused tropes removal...\n');

  try {
    // Get all tropes
    const { data: allTropes, error: tropesError } = await supabase
      .from('tropes')
      .select('id, name');

    if (tropesError) {
      console.error('Error fetching tropes:', tropesError);
      return;
    }

    console.log(`Total tropes in database: ${allTropes.length}`);

    // Get all unique trope IDs that are actually used in film_tropes
    const { data: usedTropes, error: usedError } = await supabase
      .from('film_tropes')
      .select('trope_id');

    if (usedError) {
      console.error('Error fetching used tropes:', usedError);
      return;
    }

    // Create a Set of used trope IDs for fast lookup
    const usedTropeIds = new Set(usedTropes.map(ft => ft.trope_id));
    console.log(`Tropes currently in use: ${usedTropeIds.size}\n`);

    // Find unused tropes
    const unusedTropes = allTropes.filter(trope => !usedTropeIds.has(trope.id));

    if (unusedTropes.length === 0) {
      console.log('No unused tropes found. All tropes are associated with at least one film.');
      return;
    }

    console.log(`Found ${unusedTropes.length} unused tropes:\n`);

    // Show first 20 tropes that will be deleted
    const previewCount = Math.min(20, unusedTropes.length);
    for (let i = 0; i < previewCount; i++) {
      console.log(`  - ${unusedTropes[i].name}`);
    }
    if (unusedTropes.length > 20) {
      console.log(`  ... and ${unusedTropes.length - 20} more\n`);
    } else {
      console.log('');
    }

    // Delete unused tropes
    let deletedCount = 0;
    let errorCount = 0;

    console.log('Deleting unused tropes...\n');

    for (const trope of unusedTropes) {
      const { error: deleteError } = await supabase
        .from('tropes')
        .delete()
        .eq('id', trope.id);

      if (deleteError) {
        console.error(`Error deleting trope "${trope.name}":`, deleteError);
        errorCount++;
      } else {
        deletedCount++;
        if (deletedCount % 100 === 0) {
          console.log(`Deleted ${deletedCount} tropes so far...`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Cleanup complete!`);
    console.log(`Tropes deleted: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`Errors encountered: ${errorCount}`);
    }
    console.log(`Remaining tropes: ${allTropes.length - deletedCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
removeUnusedTropes();
