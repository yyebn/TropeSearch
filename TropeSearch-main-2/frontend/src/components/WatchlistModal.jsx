import { X, Bookmark, Trash2 } from 'lucide-react';

export default function WatchlistModal({ isOpen, onClose, watchlistFilms, onRemove, onSelectFilm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="w-full max-w-3xl max-h-[80vh] rounded-lg shadow-2xl flex flex-col" style={{ backgroundColor: '#2B2B2B' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: '#3B3B3B' }}>
          <div className="flex items-center gap-2">
            <Bookmark size={24} style={{ color: '#EFDB00' }} />
            <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              My Watchlist
            </h2>
            <span className="px-2 py-0.5 rounded-full text-sm font-semibold" style={{ backgroundColor: '#3B3B3B', color: '#EFDB00' }}>
              {watchlistFilms.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70"
            style={{ color: '#999999' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {watchlistFilms.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark size={48} className="mx-auto mb-4" style={{ color: '#666666' }} />
              <p className="text-lg mb-2" style={{ color: '#999999' }}>Your watchlist is empty</p>
              <p className="text-sm" style={{ color: '#666666' }}>Add films to your watchlist to keep track of what you want to watch</p>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlistFilms.map((film) => {
                const poster = film.poster_url || film.poster || "https://via.placeholder.com/60x90?text=No+Image";
                const rating = film.imdb_rating ?? film.rating;

                return (
                  <div
                    key={film.id}
                    className="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:opacity-80 transition-all"
                    style={{ backgroundColor: '#3B3B3B' }}
                    onClick={() => {
                      onSelectFilm(film);
                      onClose();
                    }}
                  >
                    {/* Poster */}
                    <img
                      src={poster}
                      alt={`${film.name} poster`}
                      className="w-12 h-18 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/60x90?text=No+Image";
                      }}
                    />

                    {/* Film Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate" style={{ color: '#FFFFFF' }}>
                          {film.name}
                        </h3>
                        {rating && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#4C4C4C', color: '#EFDB00' }}>
                            ⭐ {Number(rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#999999' }}>
                        {film.year && <span>{film.year}</span>}
                        {film.year && film.runtime && <span>•</span>}
                        {film.runtime && <span>{film.runtime} min</span>}
                      </div>
                      {film.genres && film.genres.length > 0 && (
                        <div className="text-xs mt-1" style={{ color: '#666666' }}>
                          {film.genres.map(g => g.name).join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(film.id);
                      }}
                      className="p-2 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0"
                      style={{ backgroundColor: '#FF4444', color: '#FFFFFF' }}
                      aria-label="Remove from watchlist"
                      title="Remove from watchlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
