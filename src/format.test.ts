import { formatStartsAt, formatStatus } from './format';
import { makeMatch } from './test-utils';

describe('formatStatus', () => {
  it.each([
    ['scheduled', 'Запланирован'],
    ['finished', 'Завершён'],
    ['postponed', 'Перенесён'],
    ['unknown', 'Статус уточняется'],
  ] as const)('%s → «%s»', (status, label) => {
    expect(formatStatus(makeMatch({ id: 'm', status }))).toBe(label);
  });

  it('у идущего матча показывает минуту', () => {
    expect(formatStatus(makeMatch({ id: 'm', status: 'live', minute: 67 }))).toBe("Идёт · 67'");
  });

  it('у идущего матча без минуты — просто «Идёт»', () => {
    expect(formatStatus(makeMatch({ id: 'm', status: 'live' }))).toBe('Идёт');
  });

  it('минута 0 — тоже минута', () => {
    expect(formatStatus(makeMatch({ id: 'm', status: 'live', minute: 0 }))).toBe("Идёт · 0'");
  });
});

describe('formatStartsAt', () => {
  it('без даты — «Дата уточняется», а не 1970 год', () => {
    expect(formatStartsAt(null)).toBe('Дата уточняется');
  });

  it('битая дата — «Дата уточняется», а не Invalid Date', () => {
    expect(formatStartsAt('не дата')).toBe('Дата уточняется');
  });

  it('показывает день, месяц и время в часовом поясе устройства', () => {
    const iso = '2026-10-11T13:00:00Z';
    const local = new Date(iso);
    // Ожидаемые часы берём из той же локальной зоны, в которой идёт тест:
    // так тест не зависит от того, в каком поясе его запускают.
    const hh = String(local.getHours()).padStart(2, '0');
    const mm = String(local.getMinutes()).padStart(2, '0');

    const text = formatStartsAt(iso);

    expect(text).toContain(`${local.getDate()} октября`);
    expect(text).toContain(`${hh}:${mm}`);
  });
});
