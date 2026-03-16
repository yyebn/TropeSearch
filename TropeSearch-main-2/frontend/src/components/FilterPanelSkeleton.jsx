import { X } from "lucide-react";

export default function FilterPanelSkeleton() {
  const shimmer = {
    animation: 'shimmer 2s infinite',
    backgroundImage: 'linear-gradient(90deg, #3B3B3B 0%, #4C4C4C 50%, #3B3B3B 100%)',
    backgroundSize: '200% 100%',
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      <div className="rounded-lg pt-8 px-8s flex flex-col gap-4" style={{ color: '#FFFFFF' }}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#EFDB00' }}>Filters</h2>
          <button
            disabled
            className="text-sm flex items-center gap-1 opacity-40 cursor-not-allowed"
            style={{ color: '#999999' }}
          >
            <X className="w-4 h-4" /> Clear all
          </button>
        </div>

        {/* Tropes */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
            <h3 className="text-lg font-semibold">Tropes</h3>
          </label>

          {/* Selected Pills Skeleton */}
          <div className="mb-2 min-h-[24px]">
            <p className="text-sm italic" style={{ color: '#999999' }}>None selected...</p>
          </div>

          {/* FilterBox Skeleton */}
          <div className="flex flex-col">
            {/* Search Input Skeleton */}
            <div className="relative w-full">
              <div
                className="w-full h-9 rounded-tl-md rounded-tr-md"
                style={{ backgroundColor: '#4C4C4C' }}
              />
            </div>

            {/* Scrollable List Skeleton */}
            <div className="rounded-bl-md rounded-br-md p-2 h-44 overflow-hidden space-y-1.5" style={{ backgroundColor: '#3B3B3B' }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                  style={shimmer}
                >
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
                  <div className="h-4 rounded" style={{ backgroundColor: '#4C4C4C', width: `${60 + Math.random() * 40}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Languages + Genres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Languages Skeleton */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
              <h3 className="text-lg font-semibold">Languages</h3>
            </label>

            <div className="mb-2 min-h-[24px]">
              <p className="text-sm italic" style={{ color: '#999999' }}>None selected...</p>
            </div>

            <div className="flex flex-col">
              <div className="relative w-full">
                <div
                  className="w-full h-9 rounded-tl-md rounded-tr-md"
                  style={{ backgroundColor: '#4C4C4C' }}
                />
              </div>

              <div className="rounded-bl-md rounded-br-md p-2 h-44 overflow-hidden space-y-1.5" style={{ backgroundColor: '#3B3B3B' }}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                    style={shimmer}
                  >
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
                    <div className="h-4 rounded" style={{ backgroundColor: '#4C4C4C', width: `${50 + Math.random() * 50}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Genres Skeleton */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
              <h3 className="text-lg font-semibold">Genres</h3>
            </label>

            <div className="mb-2 min-h-[24px]">
              <p className="text-sm italic" style={{ color: '#999999' }}>None selected...</p>
            </div>

            <div className="flex flex-col">
              <div className="relative w-full">
                <div
                  className="w-full h-9 rounded-tl-md rounded-tr-md"
                  style={{ backgroundColor: '#4C4C4C' }}
                />
              </div>

              <div className="rounded-bl-md rounded-br-md p-2 h-44 overflow-hidden space-y-1.5" style={{ backgroundColor: '#3B3B3B' }}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                    style={shimmer}
                  >
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
                    <div className="h-4 rounded" style={{ backgroundColor: '#4C4C4C', width: `${50 + Math.random() * 50}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Year, Runtime, Rating Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Year Skeleton */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
              <h3 className="text-lg font-semibold">Year</h3>
            </label>

            <div className="flex items-center gap-3">
              <div className="w-20 h-9 rounded-md" style={{ backgroundColor: '#4C4C4C' }} />
              <span style={{ color: '#999999' }}>to</span>
              <div className="w-20 h-9 rounded-md" style={{ backgroundColor: '#4C4C4C' }} />
            </div>
          </div>

          {/* Runtime Skeleton */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
              <h3 className="text-lg font-semibold">Runtime</h3>
            </label>

            <div className="flex items-center gap-3">
              <div className="w-20 h-9 rounded-md" style={{ backgroundColor: '#4C4C4C' }} />
              <span style={{ color: '#999999' }}>to</span>
              <div className="w-20 h-9 rounded-md" style={{ backgroundColor: '#4C4C4C' }} />
              <span style={{ color: '#999999' }}>minutes</span>
            </div>
          </div>

          {/* Rating Skeleton */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4C4C4C' }} />
              <h3 className="text-lg font-semibold">Rating</h3>
            </label>

            <div className="relative w-full h-8 mt-2">
              {/* Track */}
              <div className="absolute top-1/2 left-0 w-full h-[4px] rounded-full -translate-y-1/2" style={{ backgroundColor: '#3B3B3B' }} />

              {/* Thumbs (disabled state) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 opacity-40"
                style={{
                  borderColor: '#1C1C1C',
                  backgroundColor: '#EFDB00',
                  left: 'calc(0% - 8px)',
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 opacity-40"
                style={{
                  borderColor: '#1C1C1C',
                  backgroundColor: '#EFDB00',
                  left: 'calc(100% - 8px)',
                }}
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-sm mt-3" style={{ color: '#999999' }}>
              {[...Array(10)].map((_, i) => (
                <span key={i + 1}>★{i + 1}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
