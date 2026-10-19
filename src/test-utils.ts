import type { Match, MatchStatus } from './types';

// Матч для тестов: по умолчанию — запланированный, без счёта.
export function makeMatch(overrides: Partial<Match> & { id: string }): Match {
  return {
    status: 'scheduled' as MatchStatus,
    startsAt: '2026-10-18T11:30:00Z',
    home: { id: `${overrides.id}-home`, name: `Хозяева ${overrides.id}`, city: 'Город' },
    away: { id: `${overrides.id}-away`, name: `Гости ${overrides.id}`, city: 'Город' },
    score: null,
    ...overrides,
  };
}

// localStorage в памяти: в тестовом окружении React Native его нет, как и на телефоне.
export function installMemoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  } as Storage;
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  return storage;
}

export function removeStorage(): void {
  delete (globalThis as { localStorage?: Storage }).localStorage;
}
