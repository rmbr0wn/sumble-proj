interface StatisticsProps {
  totalTeams: number;
  avgMentions: number;
  avgSubTeams: number;
}

export function Statistics({ totalTeams, avgMentions, avgSubTeams }: StatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-600">{totalTeams}</div>
        <div className="text-sm text-blue-800">Total Teams</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="text-2xl font-bold text-green-600">{avgMentions}</div>
        <div className="text-sm text-green-800">Avg Mentions/Team</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="text-2xl font-bold text-purple-600">{avgSubTeams}</div>
        <div className="text-sm text-purple-800">Avg Sub-teams/Team</div>
      </div>
    </div>
  );
}
