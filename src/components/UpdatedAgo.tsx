import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

// Подпись «Обновлено N сек назад».
export function UpdatedAgo({ since }: Props) {
  // Храним текущее время, а не счётчик: секунды считаются от since при каждом рендере,
  // поэтому новая дата обновления сразу сбрасывает подпись.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    // Без очистки интервалы копились бы при каждом монтировании.
    return () => clearInterval(timer);
  }, []);

  // max(0, …): сразу после обновления now может быть чуть раньше since.
  const seconds = Math.max(0, Math.floor((now - since.getTime()) / 1000));

  return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#6b7280',
  },
});
