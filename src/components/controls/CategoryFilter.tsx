import { useMemo } from 'react';

interface CategoryFilterProps {
  categories: Record<string, any[]>;
  excludedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  onSelectAll: () => void;
  onRemoveAll: () => void;
}

export function CategoryFilter({ 
  categories, 
  excludedCategories, 
  onToggleCategory, 
  onSelectAll, 
  onRemoveAll 
}: CategoryFilterProps) {
  const categoryColors = useMemo(() => ({
    'Engineering': 'bg-blue-100 text-blue-800 border-blue-200',
    'Research & AI/ML': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Marketing & Communications': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Operations & Business': 'bg-amber-100 text-amber-800 border-amber-200',
    'Support & Quality': 'bg-rose-100 text-rose-800 border-rose-200',
    'Management & Strategy': 'bg-slate-100 text-slate-800 border-slate-200',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200'
  }), []);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Categories:</label>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onRemoveAll}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Remove All
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Object.keys(categories).map(category => {
          const isExcluded = excludedCategories.has(category);
          const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.Other;
          
          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                isExcluded
                  ? 'bg-gray-200 text-gray-500 line-through border-gray-300'
                  : colorClass
              } hover:opacity-80`}
            >
              {category} ({categories[category].length})
            </button>
          );
        })}
      </div>
    </div>
  );
}
