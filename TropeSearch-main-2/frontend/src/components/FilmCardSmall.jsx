import WatchlistButton from './WatchlistButton';

export default function FilmCard({ film, index, onSelect, isInWatchlist, onToggleWatchlist }) {
  const genres = Array.isArray(film.genres)
    ? film.genres.map((g) => g.name).join(", ")
    : film.genre || "N/A";

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(film);
    }
  };

  return (
    <div
      className="grid items-center px-4 py-2 cursor-pointer focus:outline-none transition-colors"
      style={{
        backgroundColor: index % 2 === 0 ? '#3B3B3B' : '#4C4C4C',
        color: '#FFFFFF',
        gridTemplateColumns: '1fr 1fr auto auto'
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${film.name}`}
      onClick={() => onSelect?.(film)}
      onKeyDown={handleKeyDown}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      {/* Film Name */}
      <div className="font-medium truncate">{film.name}</div>

      {/* Genre */}
      <div className="text-sm truncate" style={{ color: '#999999' }}>{genres}</div>

      {/* Rating */}
      <div className="justify-self-end mr-2">
        {film.imdb_rating ? (
          <span className="px-2 py-0.5 rounded-full text-sm font-semibold" style={{ backgroundColor: '#4C4C4C', color: '#EFDB00' }}>
            ⭐ {Number(film.imdb_rating).toFixed(1)}
          </span>
        ) : (
          <span className="text-sm" style={{ color: '#999999' }}>N/A</span>
        )}
      </div>

      {/* Watchlist Button */}
      <WatchlistButton
        filmId={film.id}
        isInWatchlist={isInWatchlist}
        onToggle={onToggleWatchlist}
        size={18}
      />
    </div>
  );
}
