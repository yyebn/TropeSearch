import { useState } from "react";
import FilmModal from "./FilmModal";

export default function HomeScreen({ films, onPickGenre, onPickTrope, onBrowseAll }) {
    const [selectedFilm, setSelectedFilm] = useState(null);
    const genreCounts = new Map();
    const tropeCounts = new Map();

    const openFilm = (film) => setSelectedFilm(film);
    const closeModal = () => setSelectedFilm(null);
  
    for (const f of films) {
      (f.genres || []).forEach(g => genreCounts.set(g.id, { ...g, count: (genreCounts.get(g.id)?.count || 0) + 1 }));
      (f.tropes || []).forEach(t => tropeCounts.set(t.id, { ...t, count: (tropeCounts.get(t.id)?.count || 0) + 1 }));
    }
  
    const topGenres = [...genreCounts.values()].sort((a,b) => b.count - a.count).slice(0, 10);
    const topTropes = [...tropeCounts.values()].sort((a,b) => b.count - a.count).slice(0, 12);
  
    const topRated = [...films]
      .filter(f => f.imdb_rating != null)
      .sort((a, b) => (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0))
      .slice(0, 6);

    const latestReleases = [...films]
      .filter(f => f.year != null && (f.poster_url || f.poster))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, 6);

    return (
      <div className="px-4 md:px-0">
        {/* Hero */}
        <section className="mt-8 mb-8 rounded-2xl border p-6 md:p-8" style={{ backgroundColor: '#3B3B3B', borderColor: '#4C4C4C', color: '#FFFFFF' }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover movie tropes—fast.</h1>
          <p className="max-w-3xl" style={{ color: '#FFFFFF' }}>
            Start typing above or jump in with a popular trope or genre. We'll surface films,
            descriptions, and trope combinations so you can explore patterns across cinema.
          </p>
          <div className="mt-4">
            <button
              onClick={onBrowseAll}
              className="px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}
            >
              Browse all films
            </button>
          </div>
        </section>

        {/* Trending Tropes */}
        {topTropes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Trending Tropes</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {topTropes.map(t => (
                <button
                  key={t.id}
                  onClick={() => onPickTrope(t)}
                  className="px-3 py-1.5 text-sm rounded-full border transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#3B3B3B', color: '#FFFFFF', borderColor: '#4C4C4C' }}
                  title={`${t.name} • ${t.count} films`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Popular Genres */}
        {topGenres.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#FFFFFF' }}>Popular Genres</h2>
            <div className="flex flex-wrap gap-2">
              {topGenres.map(g => (
                <button
                  key={g.id}
                  onClick={() => onPickGenre(g)}
                  className="px-3 py-1.5 text-sm rounded-full border transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#3B3B3B', color: '#FFFFFF', borderColor: '#4C4C4C' }}
                  title={`${g.name} • ${g.count} films`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Top-Rated Picks */}
        {topRated.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#FFFFFF' }}>Top-Rated Picks</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRated.map(f => (
                <div
                  key={f.id}
                  className="rounded-xl border p-4 flex gap-3 cursor-pointer focus:outline-none transition-colors"
                  style={{ backgroundColor: '#3B3B3B', borderColor: '#4C4C4C' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open details for ${f.name}`}
                  onClick={() => openFilm(f)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4C4C4C'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B3B3B'}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openFilm(f);
                    }
                  }}
                >
                  <img
                    src={f.poster_url || f.poster || "https://via.placeholder.com/80x120?text=No+Image"}
                    alt={`${f.name} poster`}
                    className="w-16 h-24 object-cover rounded-md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate" style={{ color: '#FFFFFF' }}>{f.name}</h3>
                      {f.imdb_rating != null && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#4C4C4C', color: '#EFDB00' }}>
                          ⭐ {Number(f.imdb_rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#999999' }}>
                      {f.year ? `Year: ${f.year} • ` : ""}{f.runtime ? `Runtime: ${f.runtime}m` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Releases */}
        {latestReleases.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#FFFFFF' }}>Latest Releases</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestReleases.map(f => (
                <div
                  key={f.id}
                  className="rounded-xl border p-4 flex gap-3 cursor-pointer focus:outline-none transition-colors"
                  style={{ backgroundColor: '#3B3B3B', borderColor: '#4C4C4C' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open details for ${f.name}`}
                  onClick={() => openFilm(f)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4C4C4C'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B3B3B'}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openFilm(f);
                    }
                  }}
                >
                  <img
                    src={f.poster_url || f.poster || "https://via.placeholder.com/80x120?text=No+Image"}
                    alt={`${f.name} poster`}
                    className="w-16 h-24 object-cover rounded-md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate" style={{ color: '#FFFFFF' }}>{f.name}</h3>
                      {f.imdb_rating != null && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#4C4C4C', color: '#EFDB00' }}>
                          ⭐ {Number(f.imdb_rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#999999' }}>
                      {f.year ? `Year: ${f.year} • ` : ""}{f.runtime ? `Runtime: ${f.runtime}m` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedFilm && (
          <FilmModal film={selectedFilm} onClose={closeModal} onTropeSelect={onPickTrope} />
        )}
      </div>
    );
}
  
