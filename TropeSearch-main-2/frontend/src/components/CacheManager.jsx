import { useState } from "react";
import { Trash2, Database } from "lucide-react";
import { clearAllCache, getCacheStats } from "../utils/cache";

export default function CacheManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const handleOpen = () => {
    setIsOpen(true);
    setStats(getCacheStats());
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data? This will reload data from the server on next visit.")) {
      clearAllCache();
      setStats(getCacheStats());
      alert("Cache cleared! Refresh the page to reload data.");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity"
        style={{ color: '#999999' }}
        title="Manage cached data"
      >
        <Database className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="rounded-lg max-w-md w-full p-6" style={{ backgroundColor: '#3B3B3B', color: '#FFFFFF' }}>
        <h3 className="text-xl font-semibold mb-4">Cache Management</h3>

        <div className="space-y-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#4C4C4C' }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: '#EFDB00' }}>Cache Statistics</h4>
            {stats ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span style={{ color: '#999999' }}>Cached items:</span>{" "}
                  <span className="font-semibold">{stats.itemCount}</span>
                </p>
                <p>
                  <span style={{ color: '#999999' }}>Total size:</span>{" "}
                  <span className="font-semibold">{stats.totalSizeKB} KB</span>
                </p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#999999' }}>No cache data</p>
            )}
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: '#4C4C4C' }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: '#EFDB00' }}>About Caching</h4>
            <p className="text-sm" style={{ color: '#999999' }}>
              This app caches film data locally to reduce server load and improve performance.
              Cached data expires after 30-60 minutes.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClearCache}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#EFDB00', color: '#1C1C1C' }}
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#4C4C4C', color: '#FFFFFF' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
