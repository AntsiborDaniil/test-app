import { StyleSheet, Text, View } from 'react-native';
import { FavoriteButton } from './FavoriteButton';
import { formatStartsAt, formatStatus } from '../format';
import type { Match } from '../types';

type Props = {
  match: Match;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function MatchCard({ match, isFavorite, onToggleFavorite }: Props) {
  const { home, away, score, status } = match;

  return (
    <View style={styles.card}>
      <View style={styles.meta}>
        <Text style={styles.date}>{formatStartsAt(match.startsAt)}</Text>
        <View style={styles.metaRight}>
          <Text style={[styles.status, status === 'live' && styles.live]}>{formatStatus(match)}</Text>
          <FavoriteButton active={isFavorite} onPress={() => onToggleFavorite(match.id)} />
        </View>
      </View>

      <View style={styles.teams}>
        <Text style={[styles.team, styles.homeTeam]} numberOfLines={2}>
          {home.name}
        </Text>
        {/* Сравниваем с null: счёт 0:0 — тоже счёт. */}
        <Text style={styles.score}>{score != null ? `${score.home} : ${score.away}` : '—'}</Text>
        <Text style={[styles.team, styles.awayTeam]} numberOfLines={2}>
          {away.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
  },
  status: {
    fontSize: 13,
    color: '#374151',
  },
  live: {
    color: '#ef3124',
    fontWeight: '600',
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  team: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  homeTeam: {
    textAlign: 'right',
  },
  awayTeam: {
    textAlign: 'left',
  },
  score: {
    minWidth: 56,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});
