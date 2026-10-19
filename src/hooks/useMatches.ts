import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMatches } from '../api';
import type { Match } from '../types';

type LoadMode = 'initial' | 'refresh';

// Загрузка матчей тура: первичная загрузка, повтор после ошибки и обновление.
export function useMatches() {
  // null — данных ещё ни разу не было; [] — сервер вернул пустой тур.
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [round, setRound] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Момент последней успешной загрузки — для подписи «Обновлено N сек назад».
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Текущий запрос: при новом запросе или размонтировании старый отменяем,
  // чтобы медленный старый ответ не перезаписал свежие данные.
  const requestRef = useRef<AbortController | null>(null);

  const load = useCallback(async (mode: LoadMode) => {
    requestRef.current?.abort();
    const request = new AbortController();
    requestRef.current = request;

    if (mode === 'refresh') {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchMatches(request.signal);
      setMatches(data.matches);
      setRound(data.round);
      setUpdatedAt(new Date());
    } catch (e) {
      if (request.signal.aborted) return;
      console.warn('Не удалось загрузить матчи', e);
      setError('Не удалось загрузить матчи. Проверьте интернет и попробуйте ещё раз.');
    } finally {
      if (requestRef.current === request) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load('initial');
    return () => requestRef.current?.abort();
  }, [load]);

  const retry = useCallback(() => load('initial'), [load]);
  const refresh = useCallback(() => load('refresh'), [load]);

  return { matches, round, error, isLoading, isRefreshing, updatedAt, retry, refresh };
}
