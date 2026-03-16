import { useState } from "react";
import { Search } from "lucide-react";

export default function FilterBox({ title, items, selectedItems, onItemToggle, placeholder }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Title */}
      <h3 className="text-lg font-semibold text-left">{title}</h3>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999999' }} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-tl-md rounded-tr-md focus:outline-none"
          style={{
            backgroundColor: '#4C4C4C',
            color: '#FFFFFF',
            borderColor: '#EFDB00'
          }}
        />
      </div>

      {/* Scrollable List */}
      <div className="rounded-bl-md rounded-br-md p-2 h-44 overflow-y-auto space-y-1.5" style={{ backgroundColor: '#3B3B3B' }}>
        {filteredItems.length === 0 ? (
          <div className="text-sm text-center py-2" style={{ color: '#999999' }}>No results...</div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedItems.some(selected => selected.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => onItemToggle(item)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors"
                style={{
                  backgroundColor: isSelected ? '#EFDB00' : 'transparent',
                  color: isSelected ? '#1C1C1C' : '#FFFFFF'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onItemToggle(item)}
                  className="rounded"
                  style={{ accentColor: '#EFDB00' }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
