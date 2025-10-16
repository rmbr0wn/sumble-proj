interface TeamInfoProps {
  name: string;
  mentionCount: number;
  subTeamCount: number;
  category?: string;
  level: number;
  hasChildren: boolean;
}

export function TeamInfo({ name, mentionCount, subTeamCount, category, level, hasChildren }: TeamInfoProps) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm leading-tight truncate">{name}</h3>
      <div className="flex items-center mt-1 space-x-2 flex-wrap">
        <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded-full border">
          {mentionCount === 1 ? '1 mention' : `${mentionCount} mentions`}
        </span>
        {hasChildren && (
          <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded-full border">
            {subTeamCount === 1 ? '1 sub-team' : `${subTeamCount} sub-teams`}
          </span>
        )}
        {category && level === 0 && (
          <span className="text-xs px-2 py-1 bg-white bg-opacity-70 rounded-full border">
            {category}
          </span>
        )}
      </div>
    </div>
  );
}
