export interface ProcessedTeam {
  id: string;
  name: string;
  parent?: string;
  children: string[];
  level: number;
  mentionCount: number;
  category?: string;
}
