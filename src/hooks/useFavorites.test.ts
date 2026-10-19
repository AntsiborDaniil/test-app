import { act, renderHook } from '@testing-library/react-native';
import { installMemoryStorage, removeStorage } from '../test-utils';
import { useFavorites } from './useFavorites';

const KEY = 'matches:favorites';

afterEach(() => {
  removeStorage();
});

describe('useFavorites', () => {
  it('изначально ни один матч не в избранном', async () => {
    const { result } = await renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
    // Раньше Boolean(indexOf(id)) === Boolean(-1) === true — горели все звёзды.
    expect(result.current.isFavorite('m1')).toBe(false);
  });

  it('добавляет матч, в том числе первый в списке (индекс 0)', async () => {
    const { result } = await renderHook(() => useFavorites());

    await act(() => result.current.toggle('m1'));

    // Раньше Boolean(0) === false — первый добавленный матч выглядел не избранным.
    expect(result.current.isFavorite('m1')).toBe(true);
    expect(result.current.isFavorite('m2')).toBe(false);
  });

  it('повторное нажатие убирает матч из избранного', async () => {
    const { result } = await renderHook(() => useFavorites());

    await act(() => result.current.toggle('m1'));
    await act(() => result.current.toggle('m2'));
    await act(() => result.current.toggle('m1'));

    expect(result.current.favorites).toEqual(['m2']);
  });

  it('каждый раз отдаёт новый массив — иначе React не перерисует экран', async () => {
    const { result } = await renderHook(() => useFavorites());
    const before = result.current.favorites;

    await act(() => result.current.toggle('m1'));

    expect(result.current.favorites).not.toBe(before);
    expect(before).toEqual([]);
  });

  it('два нажатия подряд в одном рендере не теряются', async () => {
    const { result } = await renderHook(() => useFavorites());

    await act(() => {
      result.current.toggle('m1');
      result.current.toggle('m2');
    });

    expect(result.current.favorites).toEqual(['m1', 'm2']);
  });

  describe('сохранение между запусками', () => {
    it('восстанавливает избранное из localStorage при запуске', async () => {
      installMemoryStorage({ [KEY]: JSON.stringify(['m4']) });

      const { result } = await renderHook(() => useFavorites());

      expect(result.current.isFavorite('m4')).toBe(true);
      expect(result.current.isFavorite('m1')).toBe(false);
    });

    it('записывает каждое изменение в localStorage', async () => {
      const storage = installMemoryStorage();
      const { result } = await renderHook(() => useFavorites());

      await act(() => result.current.toggle('m1'));
      expect(JSON.parse(storage.getItem(KEY)!)).toEqual(['m1']);

      await act(() => result.current.toggle('m1'));
      expect(JSON.parse(storage.getItem(KEY)!)).toEqual([]);
    });

    it('после «перезапуска» избранное на месте', async () => {
      installMemoryStorage();
      const first = await renderHook(() => useFavorites());
      await act(() => first.result.current.toggle('m2'));
      await first.unmount();

      const { result } = await renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual(['m2']);
    });
  });
});
