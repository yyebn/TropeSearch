import { supabase } from '../lib/supabase';
import { getCacheItem, setCacheItem } from '../utils/cache';

export async function fetchAllFilterData() {
  try {
    const [genresResult, languagesResult, tropesResult] = await Promise.all([
      supabase.from('genres').select('*').order('name'),
      supabase.from('languages').select('*').order('name'),
      supabase.from('tropes').select('*').order('name')
    ]);

    if (genresResult.error) throw genresResult.error;
    if (languagesResult.error) throw languagesResult.error;
    if (tropesResult.error) throw tropesResult.error;

    return {
      genres: genresResult.data || [],
      languages: languagesResult.data || [],
      tropes: tropesResult.data || []
    };
  } catch (error) {
    console.error('Error fetching filter data:', error);
    throw error;
  }
}

export async function fetchGenres() {
  const CACHE_KEY = 'filter_genres';
  const cached = getCacheItem(CACHE_KEY);

  if (cached) {
    console.log('Loading genres from cache');
    return cached;
  }

  const { data, error } = await supabase
    .from('genres')
    .select('*')
    .order('name');

  if (error) throw error;

  setCacheItem(CACHE_KEY, data, 60);
  return data;
}

export async function fetchLanguages() {
  const CACHE_KEY = 'filter_languages';
  const cached = getCacheItem(CACHE_KEY);

  if (cached) {
    console.log('Loading languages from cache');
    return cached;
  }

  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('name');

  if (error) throw error;

  setCacheItem(CACHE_KEY, data, 60);
  return data;
}

export async function fetchTropes() {
  const CACHE_KEY = 'filter_tropes';
  const cached = getCacheItem(CACHE_KEY);

  if (cached) {
    console.log('Loading tropes from cache');
    return cached;
  }

  const { data, error } = await supabase
    .from('tropes')
    .select('*')
    .order('name');

  if (error) throw error;

  setCacheItem(CACHE_KEY, data, 60);
  return data;
}