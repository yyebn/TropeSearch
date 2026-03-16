import { supabase } from "../lib/supabase";
import { getCacheItem, setCacheItem } from "../utils/cache";


export async function fetchFilmDetails(filmId) {
  // Check localStorage cache first
  const CACHE_KEY = `film_details_${filmId}`;
  const cached = getCacheItem(CACHE_KEY);

  if (cached) {
    console.log(`Loading film ${filmId} details from cache`);
    return cached;
  }

  console.log(`Fetching film ${filmId} details from database`);
  const { data, error } = await supabase
    .from("films")
    .select(`
      id,
      plot,
      imdb_id,
      film_genres(genre_id, genres(id, name)),
      film_languages(language_id, languages(id, name)),
      film_tropes(trope_id, tropes(id, name))
    `)
    .eq("id", filmId)
    .single();

  if (error) {
    console.error("Error fetching film details:", error);
    return null;
  }

  // Transform to match the same structure as the main films query
  const transformed = {
    ...data,
    genres: data.film_genres?.map(fg => fg.genres) || [],
    languages: data.film_languages?.map(fl => fl.languages) || [],
    tropes: data.film_tropes?.map(ft => ft.tropes) || [],
  };

  // Cache the result for 60 minutes (film details rarely change)
  setCacheItem(CACHE_KEY, transformed, 60);
  return transformed;
}
