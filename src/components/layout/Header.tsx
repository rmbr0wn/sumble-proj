import { Statistics } from './Statistics';

interface HeaderProps {
  totalTeams: number;
  avgMentions: number;
  avgSubTeams: number;
  metadata?: {
    processedAt: string;
    totalTeams: number;
    totalMentions: number;
    rawDataSize: number;
  };
}

export function Header({ totalTeams, avgMentions, avgSubTeams, metadata }: HeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Apple Organizational Structure
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        Inferred from job posting data • {totalTeams} teams identified
        {metadata && (
          <>
            {' • '}Processed from {metadata.rawDataSize} raw entries
            {' • '}Last updated: {new Date(metadata.processedAt).toLocaleDateString()}
          </>
        )}
      </p>
      
      <Statistics 
        totalTeams={totalTeams}
        avgMentions={avgMentions}
        avgSubTeams={avgSubTeams}
      />
    </div>
  );
}
