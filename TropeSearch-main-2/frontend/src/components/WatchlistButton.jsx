import { Bookmark, BookmarkCheck } from 'lucide-react';

export default function WatchlistButton({ filmId, isInWatchlist, onToggle, size = 20 }) {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent film card click
    console.log('WatchlistButton clicked for filmId:', filmId, 'isInWatchlist:', isInWatchlist);
    onToggle(filmId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onToggle(filmId);
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="p-1.5 rounded-lg transition-all hover:opacity-70 active:opacity-50"
      style={{
        backgroundColor: isInWatchlist ? '#EFDB00' : '#3B3B3B',
        color: isInWatchlist ? '#1C1C1C' : '#FFFFFF'
      }}
      aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {isInWatchlist ? <BookmarkCheck size={size} /> : <Bookmark size={size} />}
    </button>
  );
}
