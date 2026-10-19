// Статусы, которые приходят с сервера. 'unknown' — всё, что мы не знаем:
// так новый статус на бэкенде не уронит экран, а покажется нейтрально.
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'unknown';

export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Score = {
  home: number;
  away: number;
};

export type Match = {
  id: string;
  // ISO-строка в UTC. null — дата ещё не назначена (например, у перенесённого матча).
  startsAt: string | null;
  status: MatchStatus;
  // Текущая минута, есть только у матчей в игре.
  minute?: number;
  home: Team;
  away: Team;
  // null — матч ещё не начался. Счёт 0:0 — это не null, его тоже показываем.
  score: Score | null;
};

export type MatchesResponse = {
  round: number;
  matches: Match[];
};
