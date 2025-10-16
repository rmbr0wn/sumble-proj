import { SearchBar } from './SearchBar';
import { SortControls } from './SortControls';
import { CategoryFilter } from './CategoryFilter';
import type { ProcessedTeam } from '../../types';

type SortOption = 'mentions' | 'alphabetical' | 'subteams';
type SortDirection = 'asc' | 'desc';

interface ControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortByChange: (value: string) => void;
  onDirectionToggle: () => void;
  categories: Record<string, ProcessedTeam[]>;
  excludedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  onSelectAllCategories: () => void;
  onRemoveAllCategories: () => void;
}

export function Controls({
  searchQuery,
  onSearchChange,
  sortBy,
  sortDirection,
  onSortByChange,
  onDirectionToggle,
  categories,
  excludedCategories,
  onToggleCategory,
  onSelectAllCategories,
  onRemoveAllCategories
}: ControlsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      
      <SortControls
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={onSortByChange}
        onDirectionToggle={onDirectionToggle}
      />
      
      <CategoryFilter
        categories={categories}
        excludedCategories={excludedCategories}
        onToggleCategory={onToggleCategory}
        onSelectAll={onSelectAllCategories}
        onRemoveAll={onRemoveAllCategories}
      />
    </div>
  );
}
