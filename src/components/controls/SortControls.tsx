interface SortControlsProps {
  sortBy: string;
  sortDirection: string;
  onSortByChange: (value: string) => void;
  onDirectionToggle: () => void;
}

export function SortControls({ 
  sortBy, 
  sortDirection, 
  onSortByChange, 
  onDirectionToggle 
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <label className="text-sm font-medium text-gray-700">Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="mentions">Mentions</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="subteams">Sub-teams</option>
      </select>
      <button
        onClick={onDirectionToggle}
        className="px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
}
