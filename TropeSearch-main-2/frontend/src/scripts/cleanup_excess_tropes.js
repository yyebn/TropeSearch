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

async function cleanupExcessTropes() {
  console.log('Starting trope cleanup...\n');

  try {
    // Get all films
    const { data: films, error: filmsError } = await supabase
      .from('films')
      .select('id, name');

    if (filmsError) {
      console.error('Error fetching films:', filmsError);
      return;
    }

    let totalMoviesProcessed = 0;
    let totalTropesDeleted = 0;

    // Process each film
    for (const film of films) {
      // Get trope count for this film
      const { count, error: countError } = await supabase
        .from('film_tropes')
        .select('*', { count: 'exact', head: true })
        .eq('film_id', film.id);

      if (countError) {
        console.error(`Error counting tropes for film ${film.id}:`, countError);
        continue;
      }

      const tropeCount = count || 0;

      if (tropeCount > 15) {
        totalMoviesProcessed++;
        const excessCount = tropeCount - 15;

        // Get all trope associations for this film
        const { data: tropesData, error: tropesError } = await supabase
          .from('film_tropes')
          .select('film_id, trope_id')
          .eq('film_id', film.id);

        if (tropesError) {
          console.error(`Error fetching tropes for film ${film.id}:`, tropesError);
          continue;
        }

        if (tropesData && tropesData.length > 15) {
          // Keep the first 15, delete the rest
          const tropesToDelete = tropesData.slice(15);

          // Delete the excess trope associations
          for (const trope of tropesToDelete) {
            const { error: deleteError } = await supabase
              .from('film_tropes')
              .delete()
              .eq('film_id', trope.film_id)
              .eq('trope_id', trope.trope_id);

            if (deleteError) {
              console.error(`Error deleting trope for film ${film.id}:`, deleteError);
              continue;
            }
          }

          console.log(`✓ ${film.name}`);
          console.log(`  Had ${tropeCount} tropes, deleted ${excessCount}, kept 15`);
          totalTropesDeleted += excessCount;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Cleanup complete!`);
    console.log(`Movies processed: ${totalMoviesProcessed}`);
    console.log(`Total tropes deleted: ${totalTropesDeleted}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
cleanupExcessTropes();
