import type { Match, MatchStatus } from './types';

const STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: 'Запланирован',
  live: 'Идёт',
  finished: 'Завершён',
  postponed: 'Перенесён',
  unknown: 'Статус уточняется',
};

export function formatStatus(match: Match): string {
  const label = STATUS_LABELS[match.status];
  return match.status === 'live' && match.minute != null ? `${label} · ${match.minute}'` : label;
}

// Дата и время начала в часовом поясе устройства.
// Без даты (или с битой датой) не показываем 1970 год / Invalid Date.
export function formatStartsAt(startsAt: string | null): string {
  if (!startsAt) return 'Дата уточняется';

  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return 'Дата уточняется';

  return date.toLocaleString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}
