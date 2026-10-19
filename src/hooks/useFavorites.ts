import { useState } from 'react';

// Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // indexOf возвращает -1, если id нет, и 0 для первого элемента —
  // Boolean() от этого давал true для чужих матчей и false для первого избранного.
  const isFavorite = (id: string) => favorites.includes(id);

  // Новый массив вместо push/splice: React сравнивает состояние по ссылке
  // и не перерисовывает экран, если ему отдали тот же самый массив.
  // Функциональная форма берёт актуальное состояние, даже при быстрых нажатиях подряд.
  const toggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favoriteId) => favoriteId !== id) : [...prev, id],
    );
  };

  return { favorites, isFavorite, toggle };
}
