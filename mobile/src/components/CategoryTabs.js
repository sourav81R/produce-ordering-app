import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

const categories = ['All', 'Vegetable', 'Fruit'];

const getCategoryLabel = (category) => {
  if (category === 'Vegetable') {
    return '\uD83E\uDD66 Vegetable';
  }

  if (category === 'Fruit') {
    return '\uD83C\uDF53 Fruit';
  }

  return 'All';
};

export default function CategoryTabs({ activeCategory, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.tab, activeCategory === category && styles.activeTab]}
          onPress={() => onChange(category)}
          activeOpacity={0.75}
        >
          <Text style={[styles.label, activeCategory === category && styles.activeLabel]}>
            {getCategoryLabel(category)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  activeLabel: {
    color: '#ffffff',
  },
});
