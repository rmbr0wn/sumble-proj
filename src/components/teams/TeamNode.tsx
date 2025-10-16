
import { memo, useMemo, useCallback } from 'react';
import { TeamInfo } from './TeamInfo';
import { ExpandIcon } from '../ui/ExpandIcon';
import type { ProcessedTeam } from '../../types';

interface TeamNodeProps {
  team: ProcessedTeam;
  allTeams: ProcessedTeam[];
  expandedTeams: Set<string>;
  onToggleExpand: (teamId: string) => void;
  searchQuery: string;
  level?: number;
}

export const TeamNode = memo(function TeamNode({ 
  team, 
  allTeams, 
  expandedTeams,
  onToggleExpand,
  searchQuery,
  level = 0 
}: TeamNodeProps) {
  const childTeams = useMemo(() => 
    allTeams.filter(t => team.children.includes(t.id)), 
    [allTeams, team.children]
  );
  
  const hasChildren = childTeams.length > 0;
  const isExpanded = expandedTeams.has(team.id);
  const isHighlighted = searchQuery && team.name.toLowerCase().includes(searchQuery.toLowerCase());
  
  const indentSize = level * 24; // 24px per level
  
  // Category color mapping 
  const getCategoryColor = useMemo(() => (category?: string) => {
    switch (category) {
      case 'Engineering': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'Research & AI/ML': return 'bg-indigo-50 border-indigo-200 text-indigo-900';
      case 'Marketing & Communications': return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'Operations & Business': return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'Support & Quality': return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'Management & Strategy': return 'bg-slate-50 border-slate-200 text-slate-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  }, []);
  
  const handleClick = useCallback(() => {
    if (hasChildren) {
      onToggleExpand(team.id);
    }
  }, [hasChildren, onToggleExpand, team.id]);
  
  return (
    <div className="w-full">
      <div 
        className={`
          flex items-center p-3 border rounded-lg mb-2 transition-all duration-150
          ${isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50' : getCategoryColor(team.category)}
          ${hasChildren ? 'cursor-pointer hover:shadow-sm' : ''}
        `}
        style={{ marginLeft: `${indentSize}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <div className="mr-2 text-gray-500 flex-shrink-0">
            <ExpandIcon isExpanded={isExpanded} />
          </div>
        )}
        <TeamInfo
          name={team.name}
          mentionCount={team.mentionCount}
          subTeamCount={childTeams.length}
          category={team.category}
          level={level}
          hasChildren={hasChildren}
        />
      </div>
      
      {/* Show children only when expanded */}
      {isExpanded && hasChildren && (
        <div className="ml-2">
          {childTeams
            .sort((a, b) => b.mentionCount - a.mentionCount)
            .map(childTeam => (
            <TeamNode
              key={childTeam.id}
              team={childTeam}
              allTeams={allTeams}
              expandedTeams={expandedTeams}
              onToggleExpand={onToggleExpand}
              searchQuery={searchQuery}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});
