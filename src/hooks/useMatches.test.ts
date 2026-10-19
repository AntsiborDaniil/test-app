import { act, renderHook, waitFor } from '@testing-library/react-native';
import { fetchMatches } from '../api';
import { makeMatch } from '../test-utils';
import type { MatchesResponse } from '../types';
import { useMatches } from './useMatches';

jest.mock('../api');
const fetchMatchesMock = jest.mocked(fetchMatches);

const response: MatchesResponse = { round: 12, matches: [makeMatch({ id: 'm1' })] };

beforeEach(() => {
  fetchMatchesMock.mockReset();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useMatches', () => {
  it('сначала загрузка, потом данные и время обновления', async () => {
    fetchMatchesMock.mockResolvedValue(response);

    const { result } = await renderHook(() => useMatches());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toEqual(response.matches);
    expect(result.current.round).toBe(12);
    expect(result.current.error).toBeNull();
    expect(result.current.updatedAt).toBeInstanceOf(Date);
  });

  it('при ошибке — сообщение, данных нет', async () => {
    fetchMatchesMock.mockRejectedValue(new Error('500'));

    const { result } = await renderHook(() => useMatches());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toBeNull();
    expect(result.current.error).toMatch('Не удалось загрузить матчи');
    expect(result.current.updatedAt).toBeNull();
  });

  it('retry после ошибки загружает данные и убирает ошибку', async () => {
    fetchMatchesMock.mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce(response);
    const { result } = await renderHook(() => useMatches());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(() => result.current.retry());

    expect(result.current.error).toBeNull();
    expect(result.current.matches).toEqual(response.matches);
  });

  it('пустой тур — это [], а не null', async () => {
    fetchMatchesMock.mockResolvedValue({ round: 12, matches: [] });

    const { result } = await renderHook(() => useMatches());

    await waitFor(() => expect(result.current.matches).toEqual([]));
  });

  it('неудачное обновление оставляет старый список и показывает ошибку', async () => {
    fetchMatchesMock.mockResolvedValueOnce(response).mockRejectedValueOnce(new Error('offline'));
    const { result } = await renderHook(() => useMatches());
    await waitFor(() => expect(result.current.matches).not.toBeNull());
    const updatedAt = result.current.updatedAt;

    await act(() => result.current.refresh());

    expect(result.current.matches).toEqual(response.matches);
    expect(result.current.error).not.toBeNull();
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.updatedAt).toBe(updatedAt);
  });

  it('успешное обновление подменяет данные и время', async () => {
    const fresh: MatchesResponse = { round: 12, matches: [makeMatch({ id: 'm2' })] };
    fetchMatchesMock.mockResolvedValueOnce(response).mockResolvedValueOnce(fresh);
    const { result } = await renderHook(() => useMatches());
    await waitFor(() => expect(result.current.matches).not.toBeNull());
    const updatedAt = result.current.updatedAt;

    await act(() => result.current.refresh());

    expect(result.current.matches).toEqual(fresh.matches);
    expect(result.current.updatedAt).not.toBe(updatedAt);
  });

  it('новый запрос отменяет предыдущий', async () => {
    const signals: AbortSignal[] = [];
    fetchMatchesMock.mockImplementation((signal) => {
      signals.push(signal!);
      return new Promise(() => {});
    });
    const { result } = await renderHook(() => useMatches());

    await act(() => {
      result.current.refresh();
    });

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it('отменяет запрос при уходе с экрана', async () => {
    let signal: AbortSignal | undefined;
    fetchMatchesMock.mockImplementation((s) => {
      signal = s;
      return new Promise(() => {});
    });
    const { unmount } = await renderHook(() => useMatches());

    await unmount();

    expect(signal?.aborted).toBe(true);
  });
});
