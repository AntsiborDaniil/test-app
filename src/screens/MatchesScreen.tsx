import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { useMatches } from '../hooks/useMatches';

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const { matches, round, error, isLoading, isRefreshing, retry, refresh } = useMatches();

  const title = round != null ? `Матчи ${round} тура` : 'Матчи тура';

  // Первая загрузка — данных ещё нет, показываем только загрузку или ошибку.
  if (matches === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={styles.hint}>Загружаем матчи…</Text>
          </View>
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

      <FlatList
        data={matches}
        keyExtractor={(match) => match.id}
        renderItem={({ item }) => <MatchCard match={item} />}
        ItemSeparatorComponent={Separator}
        refreshing={isRefreshing}
        onRefresh={refresh}
        contentContainerStyle={matches.length === 0 && styles.grow}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Матчей нет</Text>
            <Text style={styles.hint}>В этом туре пока не запланировано ни одного матча.</Text>
          </View>
        }
      />
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
  separator: {
    height: 8,
  },
});
