import type { Match, MatchStatus } from './types';

export type MatchFilter = 'all' | 'upcoming' | 'finished';

export const FILTER_LABELS: Record<MatchFilter, string> = {
  all: 'Все',
  upcoming: 'Предстоящие',
  finished: 'Завершённые',
};

// Какие статусы попадают в какую вкладку. live и unknown — только во «Все»:
// идущий матч уже не предстоящий, но ещё не завершён (см. SOLUTION.md).
const STATUSES_BY_FILTER: Record<Exclude<MatchFilter, 'all'>, MatchStatus[]> = {
  upcoming: ['scheduled', 'postponed'],
  finished: ['finished'],
};

export function filterMatches(matches: Match[], filter: MatchFilter): Match[] {
  if (filter === 'all') return matches;
  const statuses = STATUSES_BY_FILTER[filter];
  return matches.filter((match) => statuses.includes(match.status));
}
