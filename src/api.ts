import { MATCHES_URL } from './config';
import type { Match, MatchStatus, MatchesResponse } from './types';

const KNOWN_STATUSES: MatchStatus[] = ['scheduled', 'live', 'finished', 'postponed'];

function normalizeStatus(status: unknown): MatchStatus {
  return KNOWN_STATUSES.includes(status as MatchStatus) ? (status as MatchStatus) : 'unknown';
}

export async function fetchMatches(signal?: AbortSignal): Promise<MatchesResponse> {
  const response = await fetch(MATCHES_URL, { signal });
  // fetch не бросает ошибку на 404/500 — проверяем статус сами.
  if (!response.ok) {
    throw new Error(`Сервер ответил ${response.status}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.matches)) {
    throw new Error('Неожиданный формат ответа');
  }

  const matches: Match[] = data.matches.map((match: Match) => ({
    ...match,
    status: normalizeStatus(match.status),
    startsAt: match.startsAt ?? null,
    score: match.score ?? null,
  }));

  return { round: data.round, matches };
}
