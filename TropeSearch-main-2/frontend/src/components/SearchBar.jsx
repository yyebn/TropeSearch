import { Search, Funnel, List, LayoutGrid } from "lucide-react";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onToggleFilters,
  activeFilterCount,
  viewMode,
  setViewMode,
  showFiltersPanel
}) {
  return (
    <div className="rounded-lg shadow-sm mb-4">
      <div className="flex gap-3 items-center justify-between">
        {/* Search input */}
        <div className="flex-1 relative" style={{ color: '#999999' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none"
            style={{
              backgroundColor: '#3B3B3B',
              color: '#FFFFFF',
              borderColor: '#4C4C4C'
            }}
          />
        </div>

        {/* Right-side controls: Filters + View toggle */}
        <div className="flex items-center gap-2">
          {/* Filters */}
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}
          >
            <Funnel className="w-5 h-5" />
            {!showFiltersPanel ? "Show " : "Hide "}Filters
            {activeFilterCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#4C4C4C', color: '#EFDB00' }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View toggle (icons + text) */}
          <div className="flex items-stretch rounded-lg overflow-hidden" style={{ backgroundColor: '#3B3B3B' }}>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className="px-3 py-2 flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: viewMode === "compact" ? '#4C4C4C' : 'transparent',
                color: '#FFFFFF'
              }}
              title="Small list view"
              aria-pressed={viewMode === "compact"}
            >
              <List className="w-4 h-4" />
              <span className="text-sm">Small</span>
            </button>

            <div className="w-px" style={{ backgroundColor: '#4C4C4C' }} />

            <button
              type="button"
              onClick={() => setViewMode("large")}
              className="px-3 py-2 flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: viewMode === "large" ? '#4C4C4C' : 'transparent',
                color: '#FFFFFF'
              }}
              title="Large poster view"
              aria-pressed={viewMode === "large"}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm">Large</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
