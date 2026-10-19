import { fetchMatches } from './api';
import { MATCHES_URL } from './config';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

function respond(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  fetchMock.mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
}

const team = (id: string) => ({ id, name: id, city: 'Город' });

describe('fetchMatches', () => {
  it('запрашивает MATCHES_URL и передаёт signal для отмены', async () => {
    respond({ round: 12, matches: [] });
    const controller = new AbortController();

    await fetchMatches(controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(MATCHES_URL, { signal: controller.signal });
  });

  it('возвращает тур и матчи, сохраняя счёт 0:0', async () => {
    respond({
      round: 12,
      matches: [
        {
          id: 'm2',
          startsAt: '2026-10-11T15:30:00Z',
          status: 'finished',
          home: team('a'),
          away: team('b'),
          score: { home: 0, away: 0 },
        },
      ],
    });

    const result = await fetchMatches();

    expect(result.round).toBe(12);
    expect(result.matches[0].score).toEqual({ home: 0, away: 0 });
  });

  it('незнакомый статус превращает в unknown, а не падает', async () => {
    respond({
      round: 1,
      matches: [
        { id: 'x', startsAt: null, status: 'cancelled', home: team('a'), away: team('b'), score: null },
      ],
    });

    const { matches } = await fetchMatches();

    expect(matches[0].status).toBe('unknown');
  });

  it('отсутствующие startsAt и score приводит к null', async () => {
    respond({ round: 1, matches: [{ id: 'x', status: 'scheduled', home: team('a'), away: team('b') }] });

    const { matches } = await fetchMatches();

    expect(matches[0].startsAt).toBeNull();
    expect(matches[0].score).toBeNull();
  });

  it('на ответ 404/500 бросает ошибку, а не возвращает «пусто»', async () => {
    respond('Not Found', { ok: false, status: 404 });

    await expect(fetchMatches()).rejects.toThrow('404');
  });

  it('на ответ без массива matches бросает ошибку', async () => {
    respond({ round: 1 });

    await expect(fetchMatches()).rejects.toThrow('Неожиданный формат ответа');
  });

  it('пробрасывает сетевую ошибку', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(fetchMatches()).rejects.toThrow('Network request failed');
  });
});
