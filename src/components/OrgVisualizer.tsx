import { useState, useMemo, useCallback } from 'react';
import { Header } from './layout';
import { Controls } from './controls';
import { TeamList } from './teams';
import type { ProcessedTeam } from '../types';

type SortOption = 'mentions' | 'alphabetical' | 'subteams';
type SortDirection = 'asc' | 'desc';

interface OrgVisualizerProps {
  teams: ProcessedTeam[];
  topLevelTeams: ProcessedTeam[];
  categories: Record<string, ProcessedTeam[]>;
  metadata?: {
    processedAt: string;
    totalTeams: number;
    totalMentions: number;
    rawDataSize: number;
  };
}

export function OrgVisualizer({ teams, topLevelTeams, categories, metadata }: OrgVisualizerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('mentions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [excludedCategories, setExcludedCategories] = useState<Set<string>>(new Set());
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());


  const handleSelectAllCategories = useCallback(() => {
    setExcludedCategories(new Set());
  }, []);

  const handleRemoveAllCategories = useCallback(() => {
    setExcludedCategories(new Set(Object.keys(categories)));
  }, [categories]);

  const handleToggleCategory = useCallback((category: string) => {
    setExcludedCategories(prev => {
      const newExcluded = new Set(prev);
      if (newExcluded.has(category)) {
        newExcluded.delete(category);
      } else {
        newExcluded.add(category);
      }
      return newExcluded;
    });
  }, []);

  const handleToggleExpand = useCallback((teamId: string) => {
    setExpandedTeams(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(teamId)) {
        newExpanded.delete(teamId);
      } else {
        newExpanded.add(teamId);
      }
      return newExpanded;
    });
  }, []);
  
  const sortTeams = useCallback((teamsToSort: ProcessedTeam[]) => {
    return [...teamsToSort].sort((a, b) => {
      let result = 0;
      
      switch (sortBy) {
        case 'alphabetical':
          result = a.name.localeCompare(b.name);
          break;
        case 'subteams':
          if (a.children.length !== b.children.length) {
            result = b.children.length - a.children.length;
          } else {
            result = b.mentionCount - a.mentionCount;
          }
          break;
        case 'mentions':
        default:
          if (a.mentionCount !== b.mentionCount) {
            result = b.mentionCount - a.mentionCount;
          } else {
            result = a.name.localeCompare(b.name);
          }
          break;
      }
      
      return sortDirection === 'asc' ? -result : result;
    });
  }, [sortBy, sortDirection]);
  
  const filteredTeams = useMemo(() => {
    let teamsToFilter = searchQuery ? teams : topLevelTeams;
    
    // Apply search filter
    if (searchQuery) {
      teamsToFilter = teamsToFilter.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (excludedCategories.size > 0) {
      teamsToFilter = teamsToFilter.filter(team => 
        !excludedCategories.has(team.category || 'Other')
      );
    }
    
    return sortTeams(teamsToFilter);
  }, [teams, topLevelTeams, searchQuery, excludedCategories, sortTeams]);
  
  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const totalMentions = teams.reduce((sum, team) => sum + team.mentionCount, 0);
    const avgMentions = totalMentions / totalTeams;
    const totalSubTeams = teams.reduce((sum, team) => sum + team.children.length, 0);
    const avgSubTeams = totalSubTeams / totalTeams;
    
    return {
      totalTeams,
      totalMentions,
      avgMentions: Math.round(avgMentions * 10) / 10,
      avgSubTeams: Math.round(avgSubTeams * 10) / 10
    };
  }, [teams]);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Header 
        totalTeams={stats.totalTeams}
        avgMentions={stats.avgMentions}
        avgSubTeams={stats.avgSubTeams}
        metadata={metadata}
      />
      
      <Controls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={(value) => setSortBy(value as SortOption)}
        onDirectionToggle={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        categories={categories}
        excludedCategories={excludedCategories}
        onToggleCategory={handleToggleCategory}
        onSelectAllCategories={handleSelectAllCategories}
        onRemoveAllCategories={handleRemoveAllCategories}
      />
      
      <TeamList
        teams={filteredTeams}
        allTeams={teams}
        expandedTeams={expandedTeams}
        onToggleExpand={handleToggleExpand}
        searchQuery={searchQuery}
        excludedCategories={excludedCategories}
      />
    </div>
  );
}
