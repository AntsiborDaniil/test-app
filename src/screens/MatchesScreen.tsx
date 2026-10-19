import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { FilterTabs } from '../components/FilterTabs';
import { MatchCard } from '../components/MatchCard';
import { MatchCardSkeleton } from '../components/MatchCardSkeleton';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { filterMatches, type MatchFilter } from '../filterMatches';
import { useFavorites } from '../hooks/useFavorites';
import { useMatches } from '../hooks/useMatches';

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const { matches, round, error, isLoading, isRefreshing, updatedAt, retry, refresh } =
    useMatches();
  const { favorites, isFavorite, toggle } = useFavorites();
  const [filter, setFilter] = useState<MatchFilter>('all');

  const visibleMatches = useMemo(
    () => (matches ? filterMatches(matches, filter) : []),
    [matches, filter],
  );

  const title = round != null ? `Матчи ${round} тура` : 'Матчи тура';

  // Первая загрузка — данных ещё нет, показываем только загрузку или ошибку.
  if (matches === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {isLoading ? (
          <LoadingState />
        ) : (
          <ErrorState message={error ?? 'Не удалось загрузить матчи.'} onRetry={retry} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Данные уже есть, но обновление не удалось — оставляем старый список и сообщаем. */}
      {error && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
          <Pressable onPress={retry} accessibilityRole="button">
            <Text style={styles.link}>Повторить</Text>
          </Pressable>
        </View>
      )}

      {/* Кнопка нужна и на вебе: pull-to-refresh там не работает. */}
      <View style={styles.toolbar}>
        {updatedAt && <UpdatedAgo since={updatedAt} />}
        <Pressable
          onPress={refresh}
          disabled={isRefreshing}
          accessibilityRole="button"
          accessibilityState={{ disabled: isRefreshing }}
        >
          <Text style={[styles.link, isRefreshing && styles.disabled]}>
            {isRefreshing ? 'Обновляем…' : 'Обновить'}
          </Text>
        </Pressable>
      </View>

      <FilterTabs value={filter} onChange={setFilter} />

      <FlatList
        data={visibleMatches}
        keyExtractor={(match) => match.id}
        renderItem={({ item }) => (
          <MatchCard match={item} isFavorite={isFavorite(item.id)} onToggleFavorite={toggle} />
        )}
        // FlatList перерисовывает строки только при смене data/extraData —
        // без этого звёздочка не обновилась бы после нажатия.
        extraData={favorites}
        ItemSeparatorComponent={Separator}
        refreshing={isRefreshing}
        onRefresh={refresh}
        contentContainerStyle={visibleMatches.length === 0 && styles.grow}
        ListEmptyComponent={
          // Тур пустой целиком — или пусто только в выбранной вкладке.
          matches.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>Матчей нет</Text>
              <Text style={styles.hint}>В этом туре пока не запланировано ни одного матча.</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.hint}>В этой вкладке матчей нет.</Text>
              <Pressable onPress={() => setFilter('all')} accessibilityRole="button">
                <Text style={styles.link}>Показать все</Text>
              </Pressable>
            </View>
          )
        }
      />
    </View>
  );
}

const SKELETON_COUNT = 4;

function LoadingState() {
  return (
    <View
      style={styles.skeletons}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Загружаем матчи"
      accessibilityState={{ busy: true }}
    >
      <Text style={styles.hint}>Загружаем матчи…</Text>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <MatchCardSkeleton key={index} />
      ))}
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.hint}>{message}</Text>
      <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
        <Text style={styles.buttonText}>Повторить</Text>
      </Pressable>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  skeletons: {
    gap: 8,
  },
  grow: {
    flexGrow: 1,
  },
  hint: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ef3124',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: '#b91c1c',
  },
  link: {
    color: '#ef3124',
    fontWeight: '600',
  },
  disabled: {
    color: '#9ca3af',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  separator: {
    height: 8,
  },
});
