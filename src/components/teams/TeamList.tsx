import type { ProcessedTeam } from '../../types';
import { TeamNode } from './TeamNode';

interface TeamListProps {
  teams: ProcessedTeam[];
  allTeams: ProcessedTeam[];
  expandedTeams: Set<string>;
  onToggleExpand: (teamId: string) => void;
  searchQuery: string;
  excludedCategories: Set<string>;
}

export function TeamList({ 
  teams, 
  allTeams, 
  expandedTeams,
  onToggleExpand,
  searchQuery,
  excludedCategories 
}: TeamListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Apple Organizational Hierarchy</h2>
        {(searchQuery || excludedCategories.size > 0) && (
          <div className="mb-4">
            <p className="text-gray-600">
              {searchQuery && `Search: "${searchQuery}"`}
              {searchQuery && excludedCategories.size > 0 && ' • '}
              {excludedCategories.size > 0 && `${excludedCategories.size} categories filtered out`}
              {' • '}{teams.length} teams shown
            </p>
          </div>
        )}
        <div className="space-y-2">
          {teams.map(team => (
            <TeamNode
              key={team.id}
              team={team}
              allTeams={allTeams}
              expandedTeams={expandedTeams}
              onToggleExpand={onToggleExpand}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
