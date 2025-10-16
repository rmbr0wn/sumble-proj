import { useQuery } from '@tanstack/react-query';
import type { ProcessedTeam } from '../types';

interface OrgData {
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

export function useOrgData() {
  return useQuery({
    queryKey: ['processedOrgData'],
    queryFn: async (): Promise<OrgData> => {
      // Load the pre-processed JSON data
      const response = await fetch('/processed_org_structure.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load processed data: ${response.statusText}`);
      }
      
      const processedData: OrgData = await response.json();
      
      return processedData;
    },
    staleTime: Infinity, // Data doesn't change
    retry: 3,
  });
}
