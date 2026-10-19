import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

// Заглушка карточки на время первой загрузки: та же форма, что у MatchCard,
// поэтому экран не «прыгает», когда приходят данные.
export function MatchCardSkeleton() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Нативный драйвер анимаций есть только на iOS/Android.
    const useNativeDriver = Platform.OS !== 'web';
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.meta}>
        <View style={[styles.bar, styles.date]} />
        <View style={[styles.bar, styles.status]} />
      </View>
      <View style={styles.teams}>
        <View style={[styles.bar, styles.team]} />
        <View style={[styles.bar, styles.score]} />
        <View style={[styles.bar, styles.team]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  date: {
    width: 140,
  },
  status: {
    width: 90,
  },
  team: {
    flex: 1,
    height: 18,
  },
  score: {
    width: 48,
    height: 20,
  },
});
