// src/components/Navbar.jsx
import { RefreshCw, Bookmark } from 'lucide-react';
import CacheManager from "./CacheManager";
import GroupSessionButton from "./GroupSessionButton";

export default function NavBar({
  onLogoClick,
  activeSession,
  participants,
  currentFilters,
  autoSync,
  onToggleAutoSync,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onEndSession,
  onRefreshFilters,
  onOpenWatchlist,
  watchlistCount
}) {
    return (
      <nav className="sticky top-0 z-20" style={{ backgroundColor: '#070707' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onLogoClick}
            className="text-2xl font-extrabold hover:opacity-90 active:opacity-80"
            style={{ color: '#EFDB00' }}
            aria-label="Go to Home"
          >
            TropeSearch
          </button>
          <div className="flex items-center gap-3">
            {activeSession && (
              <>
                <button
                  onClick={onRefreshFilters}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-80 active:opacity-60"
                  style={{
                    backgroundColor: '#3B3B3B',
                    color: '#EFDB00'
                  }}
                  aria-label="Refresh Filters"
                  title="Refresh session filters"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={onToggleAutoSync}
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80 active:opacity-60"
                  style={{
                    backgroundColor: autoSync ? '#EFDB00' : '#3B3B3B',
                    color: autoSync ? '#1C1C1C' : '#EFDB00'
                  }}
                  aria-label="Toggle Auto Sync"
                  title={autoSync ? 'Auto-sync ON' : 'Auto-sync OFF'}
                >
                  {autoSync ? 'AUTO' : 'MANUAL'}
                </button>
              </>
            )}
            <button
              onClick={onOpenWatchlist}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-80 active:opacity-60"
              style={{
                backgroundColor: '#3B3B3B',
                color: '#EFDB00'
              }}
              aria-label="Open Watchlist"
              title="My Watchlist"
            >
              <Bookmark size={18} />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}>
                  {watchlistCount}
                </span>
              )}
            </button>
            <GroupSessionButton
              activeSession={activeSession}
              participants={participants}
              currentFilters={currentFilters}
              onCreateSession={onCreateSession}
              onJoinSession={onJoinSession}
              onLeaveSession={onLeaveSession}
              onEndSession={onEndSession}
            />
            <CacheManager />
          </div>
        </div>
      </nav>
    );
}
  