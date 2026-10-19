// Хранение избранного между запусками через localStorage.
// localStorage есть только в браузере: в Expo Go на телефоне его нет,
// там функции молча ничего не делают и избранное живёт до закрытия приложения.
const STORAGE_KEY = 'matches:favorites';

function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    // Доступ к localStorage может бросить исключение (например, при запрете cookies).
    return null;
  }
}

export function loadFavorites(): string[] {
  try {
    const raw = getStorage()?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // В хранилище может лежать что угодно (старый формат, ручная правка) — берём только строки.
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]): void {
  try {
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Хранилище переполнено или недоступно — избранное просто не переживёт перезапуск.
  }
}
