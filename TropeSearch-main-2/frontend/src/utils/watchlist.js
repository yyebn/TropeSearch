// Watchlist utility functions using localStorage

const WATCHLIST_KEY = 'tropesearch_watchlist';

/**
 * Get all films from the watchlist
 * @returns {Array} Array of film IDs
 */
export function getWatchlist() {
  try {
    const watchlist = localStorage.getItem(WATCHLIST_KEY);
    return watchlist ? JSON.parse(watchlist) : [];
  } catch (error) {
    console.error('Failed to get watchlist:', error);
    return [];
  }
}

/**
 * Add a film to the watchlist
 * @param {string} filmId - The IMDB ID of the film
 * @returns {boolean} Success status
 */
export function addToWatchlist(filmId) {
  try {
    const watchlist = getWatchlist();
    if (!watchlist.includes(filmId)) {
      watchlist.push(filmId);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
      return true;
    }
    return false; // Already in watchlist
  } catch (error) {
    console.error('Failed to add to watchlist:', error);
    return false;
  }
}

/**
 * Remove a film from the watchlist
 * @param {string} filmId - The IMDB ID of the film
 * @returns {boolean} Success status
 */
export function removeFromWatchlist(filmId) {
  try {
    const watchlist = getWatchlist();
    const filtered = watchlist.filter(id => id !== filmId);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to remove from watchlist:', error);
    return false;
  }
}

/**
 * Check if a film is in the watchlist
 * @param {string} filmId - The IMDB ID of the film
 * @returns {boolean}
 */
export function isInWatchlist(filmId) {
  const watchlist = getWatchlist();
  return watchlist.includes(filmId);
}

/**
 * Clear the entire watchlist
 * @returns {boolean} Success status
 */
export function clearWatchlist() {
  try {
    localStorage.removeItem(WATCHLIST_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear watchlist:', error);
    return false;
  }
}

/**
 * Get the count of films in the watchlist
 * @returns {number}
 */
export function getWatchlistCount() {
  return getWatchlist().length;
}
