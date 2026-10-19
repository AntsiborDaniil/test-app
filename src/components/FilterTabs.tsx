import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FILTER_LABELS, type MatchFilter } from '../filterMatches';

const FILTERS = Object.keys(FILTER_LABELS) as MatchFilter[];

type Props = {
  value: MatchFilter;
  onChange: (filter: MatchFilter) => void;
};

// Переключатель «Все / Предстоящие / Завершённые».
export function FilterTabs({ value, onChange }: Props) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {FILTERS.map((filter) => {
        const selected = filter === value;
        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            style={[styles.tab, selected && styles.selected]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {FILTER_LABELS[filter]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedLabel: {
    color: '#111827',
    fontWeight: '600',
  },
});
