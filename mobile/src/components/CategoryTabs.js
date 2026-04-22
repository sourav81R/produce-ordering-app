import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

const categories = ['All', 'Vegetable', 'Fruit'];

export default function CategoryTabs({ activeCategory, onChange }) {
  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.tab, activeCategory === category && styles.activeTab]}
          onPress={() => onChange(category)}
        >
          <Text style={[styles.label, activeCategory === category && styles.activeLabel]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#ffffff',
  },
});
