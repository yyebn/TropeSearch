import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { fetchFilmDetails } from "../services/filmService";
import WatchlistButton from './WatchlistButton';

export default function FilmModal({ film, onClose, onTropeSelect, isInWatchlist, onToggleWatchlist }) {
  const [hasPoster, setHasPoster] = useState(Boolean(film?.poster_url && film.poster_url !== 'N/A'));
  const [fullDetails, setFullDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const tropesRef = useRef(null);

  const handleTropeClick = (trope) => {
    if (onTropeSelect) {
      onTropeSelect(trope);
    }
    onClose();
  };

  // Fetch full film details when modal opens
  useEffect(() => {
    async function loadDetails() {
      if (!film?.id) return;
      setLoadingDetails(true);
      const details = await fetchFilmDetails(film.id);
      console.log('FilmModal - Full details:', details);
      console.log('FilmModal - Film prop:', film);
      console.log('FilmModal - Plot from details:', details?.plot);
      console.log('FilmModal - Plot from film:', film?.plot);
      setFullDetails(details);
      setLoadingDetails(false);
    }
    loadDetails();
  }, [film?.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${film?.name ?? "Selected film"}`}
      onClick={onClose}
    >
      <div
        className="rounded-lg max-w-3xl w-full shadow-lg max-h-[90vh] flex flex-col overflow-hidden"
        style={{ backgroundColor: '#3B3B3B' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-4 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-3xl font-semibold truncate" style={{ color: '#FFFFFF' }}>{film.name}</h3>
            <p className="text-sm" style={{ color: '#999999' }}>{film.year}{film.director ? ` • Directed by ${film.director}` : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <WatchlistButton
              filmId={film.id}
              isInWatchlist={isInWatchlist}
              onToggle={onToggleWatchlist}
              size={20}
            />
            <button
              onClick={onClose}
              aria-label="Close"
              className="hover:opacity-70"
              style={{ color: '#999999' }}
              autoFocus
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto flex-1 min-h-0">
          {hasPoster && film.poster_url && (
            <img
              src={film.poster_url}
              alt={`${film.name} poster`}
              className="w-full rounded max-h-[200px] md:max-h-none object-contain md:object-cover"
              onError={() => setHasPoster(false)}
              onLoad={() => setHasPoster(true)}
            />
          )}

          <div className={`${hasPoster ? 'md:col-span-2' : 'md:col-span-3'}`}>
            <div className="flex items-center gap-4 mb-3">
              {film.imdb_rating && (
                <div className="px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: '#4C4C4C', color: '#EFDB00' }}>
                  ⭐ {Number(film.imdb_rating).toFixed(1)}
                </div>
              )}
              {film.runtime && <div className="text-sm" style={{ color: '#FFFFFF' }}>{film.runtime} min</div>}
            </div>

            {loadingDetails ? (
              <p className="text-sm mb-3" style={{ color: '#999999' }}>Loading details...</p>
            ) : (
              <>
                {(fullDetails?.plot || film.plot) && (
                  <p className="mb-4 leading-relaxed" style={{ color: '#FFFFFF' }}>
                    {fullDetails?.plot || film.plot}
                  </p>
                )}

                <div className="text-sm space-y-2" style={{ color: '#FFFFFF' }}>
                  {/* Director */}
                  {film.director && (
                    <div>
                      <strong style={{ color: '#EFDB00' }}>Director:</strong>{" "}
                      {film.director}
                    </div>
                  )}

                  {/* Genres - display from array if available */}
                  {Array.isArray(film.genres) && film.genres.length > 0 && (
                    <div>
                      <strong style={{ color: '#EFDB00' }}>Genres:</strong>{" "}
                      {film.genres.map((g) => g.name).join(", ")}
                    </div>
                  )}

                  {/* Languages - display from array if available */}
                  {Array.isArray(film.languages) && film.languages.length > 0 && (
                    <div>
                      <strong style={{ color: '#EFDB00' }}>Languages:</strong>{" "}
                      {film.languages.map((l) => l.name).join(", ")}
                    </div>
                  )}

                  {/* Tropes with scrollable inline layout */}
                  {Array.isArray(film.tropes) && film.tropes.length > 0 && (
                    <div className="flex items-center gap-2 relative max-w-full">
                      <strong className="flex-shrink-0" style={{ color: '#EFDB00' }}>Tropes:</strong>

                      <div className="flex-1 relative overflow-hidden">
                        <div
                          ref={tropesRef}
                          className="flex gap-2 whitespace-nowrap overflow-x-auto hide-scrollbar py-1"
                        >
                          {film.tropes.map((trope) => (
                            <button
                              key={trope.id}
                              type="button"
                              onClick={() => handleTropeClick(trope)}
                              className="px-2 py-1 text-xs rounded-full flex-shrink-0 transition-opacity hover:opacity-80"
                              style={{ backgroundColor: '#4C4C4C', color: '#FFFFFF' }}
                            >
                              {trope.name}
                            </button>
                          ))}
                        </div>

                        {/* Right-side gradient fade */}
                        <div
                          className="pointer-events-none absolute right-0 top-0 bottom-0 w-10"
                          style={{ background: 'linear-gradient(to left, #3B3B3B, transparent)' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* IMDb Link */}
                  {(fullDetails?.imdb_id || film.imdb_id) && (
                    <div>
                      <strong style={{ color: '#EFDB00' }}>IMDb:</strong>{" "}
                      <a
                        href={`https://www.imdb.com/title/${fullDetails?.imdb_id || film.imdb_id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                        style={{ color: '#EFDB00' }}
                      >
                        View on IMDb
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
