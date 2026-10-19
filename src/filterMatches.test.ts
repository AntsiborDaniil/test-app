import { filterMatches } from './filterMatches';
import { makeMatch } from './test-utils';
import type { Match, MatchStatus } from './types';

const statuses: MatchStatus[] = ['scheduled', 'live', 'finished', 'postponed', 'unknown'];
const matches = statuses.map((status) => makeMatch({ id: status, status }));

const ids = (list: Match[]) => list.map((match) => match.id);

describe('filterMatches', () => {
  it('«Все» возвращает все матчи в исходном порядке', () => {
    expect(ids(filterMatches(matches, 'all'))).toEqual(statuses);
  });

  it('«Предстоящие» — запланированные и перенесённые', () => {
    expect(ids(filterMatches(matches, 'upcoming'))).toEqual(['scheduled', 'postponed']);
  });

  it('«Завершённые» — только завершённые', () => {
    expect(ids(filterMatches(matches, 'finished'))).toEqual(['finished']);
  });

  it.each(['upcoming', 'finished'] as const)('идущий и неизвестный матчи не попадают в «%s»', (filter) => {
    const result = ids(filterMatches(matches, filter));
    expect(result).not.toContain('live');
    expect(result).not.toContain('unknown');
  });

  it('пустой список остаётся пустым', () => {
    expect(filterMatches([], 'upcoming')).toEqual([]);
  });

  it('не меняет исходный массив', () => {
    const copy = [...matches];
    filterMatches(matches, 'finished');
    expect(matches).toEqual(copy);
  });
});
