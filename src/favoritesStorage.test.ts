import { loadFavorites, saveFavorites } from './favoritesStorage';
import { installMemoryStorage, removeStorage } from './test-utils';

const KEY = 'matches:favorites';

afterEach(() => {
  removeStorage();
});

describe('favoritesStorage', () => {
  it('сохраняет и читает список id', () => {
    installMemoryStorage();

    saveFavorites(['m1', 'm4']);

    expect(loadFavorites()).toEqual(['m1', 'm4']);
  });

  it('пустое хранилище — пустой список', () => {
    installMemoryStorage();

    expect(loadFavorites()).toEqual([]);
  });

  it('битый JSON не роняет приложение', () => {
    installMemoryStorage({ [KEY]: '{не json' });

    expect(loadFavorites()).toEqual([]);
  });

  it('берёт только строки, если в хранилище чужой формат', () => {
    installMemoryStorage({ [KEY]: JSON.stringify(['m1', 42, null, 'm2']) });

    expect(loadFavorites()).toEqual(['m1', 'm2']);
  });

  it('не массив — пустой список', () => {
    installMemoryStorage({ [KEY]: JSON.stringify({ m1: true }) });

    expect(loadFavorites()).toEqual([]);
  });

  it('без localStorage (телефон) ничего не делает и не падает', () => {
    removeStorage();

    expect(() => saveFavorites(['m1'])).not.toThrow();
    expect(loadFavorites()).toEqual([]);
  });

  it('если запись падает (хранилище переполнено) — не роняет приложение', () => {
    const storage = installMemoryStorage();
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    expect(() => saveFavorites(['m1'])).not.toThrow();
  });
});
