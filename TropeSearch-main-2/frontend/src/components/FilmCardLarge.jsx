import { useState, useRef, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import WatchlistButton from './WatchlistButton';

export default function FilmCardLarge({ film, onSelect, isInWatchlist, onToggleWatchlist }) {
  const poster =
    film.poster_url || film.poster || "https://via.placeholder.com/80x120?text=No+Image";
  const rating = film.imdb_rating ?? film.rating;

  const tropes = Array.isArray(film.tropes) ? film.tropes : [];
  const [visibleCount, setVisibleCount] = useState(15);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const nearEnd = scrollLeft + clientWidth >= scrollWidth - 100;
      if (nearEnd && visibleCount < tropes.length) {
        setVisibleCount((prev) => Math.min(prev + 15, tropes.length));
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [visibleCount, tropes.length]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(film);
    }
  };

  return (
    <div
      className="rounded-lg p-4 cursor-pointer focus:outline-none transition-colors border"
      style={{
        backgroundColor: isHovered ? '#4C4C4C' : '#3B3B3B',
        color: '#FFFFFF',
        borderColor: '#4C4C4C'
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${film.name}`}
      onClick={() => onSelect?.(film)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4">
        {/* Lazy-loaded poster */}
        <LazyLoadImage
          src={poster}
          alt={`${film.name} poster`}
          effect="blur"
          className="w-20 h-28 object-cover rounded-md flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* Title + Rating + Watchlist */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-wrap flex-1">
              <h3 className="text-xl font-semibold">{film.name}</h3>
              {rating && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-semibold" style={{ backgroundColor: '#4C4C4C', color: '#EFDB00' }}>
                  <span role="img" aria-label="star">⭐</span>
                  {Number(rating).toFixed(1)}
                </span>
              )}
            </div>
            <WatchlistButton
              filmId={film.id}
              isInWatchlist={isInWatchlist}
              onToggle={onToggleWatchlist}
              size={20}
            />
          </div>

          {/* Year and Runtime */}
          {(film.year || film.runtime) && (
            <p className="text-sm mt-2" style={{ color: '#999999' }}>
              {film.year ? `${film.year}` : ""}{film.year && film.runtime ? " • " : ""}{film.runtime ? `${film.runtime} min` : ""}
            </p>
          )}

          {/* Tropes Section */}
          {tropes.length > 0 && (
            <div className="mt-2 flex items-center gap-2 relative max-w-full">
              <span className="text-sm flex-shrink-0" style={{ color: '#999999' }}>Tropes:</span>

              <div className="flex-1 relative overflow-hidden">
                <div
                  ref={containerRef}
                  className="flex gap-2 whitespace-nowrap overflow-x-auto hide-scrollbar py-1"
                >
                  {tropes.slice(0, visibleCount).map((t) => (
                    <span
                      key={t.id || t.name}
                      className="text-xs inline-block px-2 py-1 rounded-full flex-shrink-0 transition-all hover:opacity-80"
                      style={{
                        backgroundColor: isHovered ? '#5A5A5A' : '#4C4C4C',
                        color: '#FFFFFF'
                      }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>

                {/* Right-side gradient fade */}
                <div
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 transition-all"
                  style={{
                    background: `linear-gradient(to left, ${isHovered ? '#4C4C4C' : '#3B3B3B'}, transparent)`
                  }}
                />
              </div>
            </div>
          )}

          {/* Directors */}
          {(film.director || film.directors) && (
            <p className="text-sm mt-2" style={{ color: '#FFFFFF' }}>
              <span style={{ color: '#999999' }}>Director(s):</span>{" "}
              {film.directors?.join?.(", ") || film.director}
            </p>
          )}

          {/* Genres */}
          {Array.isArray(film.genres) && film.genres.length > 0 && (
            <p className="text-sm mt-1" style={{ color: '#FFFFFF' }}>
              <span style={{ color: '#999999' }}>Genre:</span>{" "}
              {film.genres.map((g) => g.name).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
