import { useEffect, useState, useRef } from "react";
import { supabase } from "./lib/supabase";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import FilmList from "./components/FilmList";
import NavBar from "./components/Navbar";
import HomeScreen from "./components/HomeScreen";
import WatchlistModal from "./components/WatchlistModal";
import { getCacheItem, setCacheItem } from "./utils/cache";
import {
  createSession,
  joinSession,
  leaveSession,
  endSession,
  updateSessionFilters,
  updateParticipantLastSeen,
  getSessionParticipants,
  getSession,
  subscribeToSessionFilters,
  subscribeToSessionParticipants
} from "./services/sessionService";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist as checkIsInWatchlist
} from "./utils/watchlist";

const ITEMS_PER_PAGE = 20;

function App() {
  const [films, setFilms] = useState([]);
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // View mode
  const [viewMode, setViewMode] = useState(() => (
    localStorage.getItem("viewMode") || "large"
  ));
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  // Filters
  const [filters, setFilters] = useState({
    minYear: "",
    maxYear: "",
    minRating: "",
    maxRating: "",
    minRuntime: "",
    maxRuntime: "",
    director: "",
    genres: [],
    languages: [],
    tropes: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHome, setIsHome] = useState(true);
  const [error, setError] = useState(null);

  // Group session state
  const [activeSession, setActiveSession] = useState(null);
  const [sessionParticipants, setSessionParticipants] = useState([]);
  const [autoSync, setAutoSync] = useState(true); // Auto-sync enabled by default
  const filterSubscription = useRef(null);
  const participantSubscription = useRef(null);
  const heartbeatInterval = useRef(null);
  const lastSyncedFilters = useRef(null);

  // Watchlist state
  const [watchlistIds, setWatchlistIds] = useState(() => getWatchlist());
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  // Debug watchlist state changes
  useEffect(() => {
    console.log('Watchlist state updated:', watchlistIds);
  }, [watchlistIds]);

  useEffect(() => { getFilms(); }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [films, searchQuery, filters]);

  const activeFilterCount = Object.entries(filters).reduce((count, [, v]) => {
    if (Array.isArray(v)) return count + (v.length ? 1 : 0);
    return count + (v !== "" ? 1 : 0);
  }, 0);

  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasFilters = activeFilterCount > 0;
    if (hasQuery || hasFilters) setIsHome(false);
  }, [searchQuery, activeFilterCount]);

  async function getFilms() {
    setLoading(true);

    const CACHE_KEY = "films_data";
    const cachedFilms = getCacheItem(CACHE_KEY);

    if (cachedFilms) {
      console.log("Loading films from cache");
      setFilms(cachedFilms);
      setFilteredFilms(cachedFilms);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("films")
      .select(`
        id,
        name,
        year,
        runtime,
        imdb_rating,
        poster_url,
        director,
        film_genres(genre_id, genres(id, name)),
        film_languages(language_id, languages(id, name)),
        film_tropes(trope_id, tropes(id, name))
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching films:", error);
      setError("Unable to connect to database. Please check your internet connection and refresh.");
      setFilms([]);
      setFilteredFilms([]);
    } else {
      setError(null);
      const transformed = (data || []).map(film => ({
        ...film,
        genres: film.film_genres?.map(fg => fg.genres) || [],
        languages: film.film_languages?.map(fl => fl.languages) || [],
        tropes: film.film_tropes?.map(ft => ft.tropes) || [],
      }));

      setFilms(transformed);
      setFilteredFilms(transformed);

      setCacheItem(CACHE_KEY, transformed, 30);
      console.log("Films cached for 30 minutes");
    }

    setLoading(false);
  }

  function applyFilters() {
    let results = [...films];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.director?.toLowerCase().includes(q)
      );
    }

    // Year
    if (filters.minYear) results = results.filter(f => f.year >= parseInt(filters.minYear));
    if (filters.maxYear) results = results.filter(f => f.year <= parseInt(filters.maxYear));

    // Rating
    if (filters.minRating) results = results.filter(f => (f.imdb_rating ?? 0) >= parseFloat(filters.minRating));
    if (filters.maxRating) results = results.filter(f => (f.imdb_rating ?? 0) <= parseFloat(filters.maxRating));

    // Runtime
    if (filters.minRuntime) {
      const minRuntime = parseInt(filters.minRuntime);
      results = results.filter(f => f.runtime && f.runtime >= minRuntime);
    }
    if (filters.maxRuntime) {
      const maxRuntime = parseInt(filters.maxRuntime);
      results = results.filter(f => f.runtime && f.runtime <= maxRuntime);
    }

    // Director
    if (filters.director) {
      const dq = filters.director.toLowerCase();
      results = results.filter(f => f.director?.toLowerCase().includes(dq));
    }

    // Genres
    if (filters.genres?.length) {
      results = results.filter(f =>
        filters.genres.every(g => f.genres.some(fg => fg.id === g.id))
      );
    }

    // Languages
    if (filters.languages?.length) {
      results = results.filter(f =>
        filters.languages.every(l => f.languages.some(fl => fl.id === l.id))
      );
    }

    // Tropes
    if (filters.tropes?.length) {
      results = results.filter(f =>
        filters.tropes.every(t => f.tropes.some(ft => ft.id === t.id))
      );
    }

    setFilteredFilms(results);
  }

  function clearFilters() {
    setSearchQuery("");
    setFilters({
      minYear: "",
      maxYear: "",
      minRating: "",
      maxRating: "",
      minRuntime: "",
      maxRuntime: "",
      director: "",
      genres: [],
      languages: [],
      tropes: []
    });
    setCurrentPage(1);
  }

  function handleFilterChange(field, value) {
    setFilters(prev => ({ ...prev, [field]: value }));
  }

  function handleLogoClick() {
    setIsHome(true);
    setShowFilters(false);
    setSearchQuery("");
    clearFilters();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePickGenre(genre) {
    setFilters(prev => ({ ...prev, genres: [genre] }));
    setIsHome(false);
  }

  function handlePickTrope(trope) {
    setFilters(prev => ({ ...prev, tropes: [trope] }));
    setIsHome(false);
  }

  function handleBrowseAll() {
    clearFilters();
    setIsHome(false);
  }

  // Watchlist handlers
  function handleToggleWatchlist(filmId) {
    console.log('Toggle watchlist for:', filmId);
    console.log('Currently in watchlist:', checkIsInWatchlist(filmId));

    if (checkIsInWatchlist(filmId)) {
      console.log('Removing from watchlist');
      removeFromWatchlist(filmId);
    } else {
      console.log('Adding to watchlist');
      addToWatchlist(filmId);
    }

    // Update state to trigger re-render
    const newWatchlist = getWatchlist();
    console.log('Updated watchlist:', newWatchlist);
    setWatchlistIds(newWatchlist);
  }

  function handleRemoveFromWatchlist(filmId) {
    removeFromWatchlist(filmId);
    setWatchlistIds(getWatchlist());
  }

  // Get watchlist films (films that are in the watchlist)
  const watchlistFilms = films.filter(film => watchlistIds.includes(film.id));

  // Session handlers
  async function handleCreateSession() {
    try {
      const { session, participantId } = await createSession(filters);
      setActiveSession({ session, participantId });

      // Load initial participants
      const participants = await getSessionParticipants(session.session_code);
      setSessionParticipants(participants);

      // Subscribe to updates
      setupSessionSubscriptions(session.session_code);
      setupHeartbeat(participantId);
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  async function handleJoinSession(sessionCode, displayName) {
    try {
      const { session, participantId } = await joinSession(sessionCode, displayName);
      setActiveSession({ session, participantId });

      // Update local filters to match session
      setFilters(session.current_filters);

      // Load participants
      const participants = await getSessionParticipants(session.session_code);
      setSessionParticipants(participants);

      // Subscribe to updates
      setupSessionSubscriptions(session.session_code);
      setupHeartbeat(participantId);
    } catch (error) {
      console.error('Failed to join session:', error);
      throw error;
    }
  }

  async function handleLeaveSession() {
    if (!activeSession) return;

    try {
      await leaveSession(activeSession.participantId);
      cleanupSession();
    } catch (error) {
      console.error('Failed to leave session:', error);
    }
  }

  async function handleEndSession() {
    if (!activeSession) return;

    try {
      await endSession(activeSession.session.session_code);
      cleanupSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  function setupSessionSubscriptions(sessionCode) {
    // Subscribe to filter changes
    filterSubscription.current = subscribeToSessionFilters(sessionCode, (newFilters) => {
      const newFiltersStr = JSON.stringify(newFilters);
      const lastFiltersStr = JSON.stringify(lastSyncedFilters.current);

      // Only update if filters actually changed AND auto-sync is enabled
      if (newFiltersStr !== lastFiltersStr) {
        if (autoSync) {
          console.log('✅ Auto-applying remote filter update');
          lastSyncedFilters.current = newFilters;
          setFilters(newFilters);
        } else {
          console.log('📥 Filter update available (manual sync mode)');
          lastSyncedFilters.current = newFilters; // Track for manual refresh
        }
      } else {
        console.log('⏭️ Skipping duplicate filter update');
      }
    });

    // Subscribe to participant changes
    participantSubscription.current = subscribeToSessionParticipants(sessionCode, (participants) => {
      setSessionParticipants(participants);
    });
  }

  function setupHeartbeat(participantId) {
    // Send heartbeat every 15 seconds
    heartbeatInterval.current = setInterval(() => {
      updateParticipantLastSeen(participantId);
    }, 15000);
  }

  function cleanupSession() {
    // Unsubscribe from real-time updates
    if (filterSubscription.current) {
      supabase.removeChannel(filterSubscription.current);
      filterSubscription.current = null;
    }
    if (participantSubscription.current) {
      supabase.removeChannel(participantSubscription.current);
      participantSubscription.current = null;
    }

    // Clear heartbeat
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }

    // Clear session state
    setActiveSession(null);
    setSessionParticipants([]);
  }

  // Manual refresh function
  async function handleRefreshFilters() {
    if (!activeSession?.session?.session_code) return;

    try {
      const session = await getSession(activeSession.session.session_code);
      setFilters(session.current_filters);

      // Also refresh participants
      const participants = await getSessionParticipants(activeSession.session.session_code);
      setSessionParticipants(participants);
    } catch (error) {
      console.error('Failed to refresh filters:', error);
    }
  }

  // Update session filters when local filters change (if in a session)
  useEffect(() => {
    if (activeSession?.session?.session_code) {
      const timeoutId = setTimeout(() => {
        updateSessionFilters(activeSession.session.session_code, filters);
      }, 500); // Debounce filter updates

      return () => clearTimeout(timeoutId);
    }
  }, [filters, activeSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredFilms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFilms = filteredFilms.slice(startIndex, endIndex);

  function handlePageChange(newPage) {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1C1C1C' }}>
        <div className="text-xl" style={{ color: '#999999' }}>Loading films…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1C1C1C' }}>
      <NavBar
        onLogoClick={handleLogoClick}
        activeSession={activeSession}
        participants={sessionParticipants}
        currentFilters={filters}
        autoSync={autoSync}
        onToggleAutoSync={() => setAutoSync(!autoSync)}
        onCreateSession={handleCreateSession}
        onJoinSession={handleJoinSession}
        onLeaveSession={handleLeaveSession}
        onEndSession={handleEndSession}
        onRefreshFilters={handleRefreshFilters}
        onOpenWatchlist={() => setShowWatchlistModal(true)}
        watchlistCount={watchlistIds.length}
      />

      <div className="max-w-6xl mx-auto mt-6 pb-16 px-4">
        {error && (
          <div className="mb-4 p-4 border rounded-lg" style={{ backgroundColor: '#3B3B3B', borderColor: '#EFDB00', color: '#FFFFFF' }}>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 rounded text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}
            >
              Reload Page
            </button>
          </div>
        )}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFilterCount={activeFilterCount}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFiltersPanel={showFilters}
        />

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          isVisible={showFilters}
        />

        {isHome ? (
          <HomeScreen
            films={films}
            onPickGenre={handlePickGenre}
            onPickTrope={handlePickTrope}
            onBrowseAll={handleBrowseAll}
          />
        ) : (
          <FilmList
            films={paginatedFilms}
            totalFilms={filteredFilms.length}
            onClearFilters={clearFilters}
            viewMode={viewMode}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onTropeSelect={handlePickTrope}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}
      </div>

      {/* Watchlist Modal */}
      <WatchlistModal
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        watchlistFilms={watchlistFilms}
        onRemove={handleRemoveFromWatchlist}
        onSelectFilm={(film) => {
          // You can add film selection logic here if needed
          console.log('Selected film:', film);
        }}
      />
    </div>
  );
}

export default App;
