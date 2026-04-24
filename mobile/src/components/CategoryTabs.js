import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

const categories = ['All', 'Vegetable', 'Fruit'];

const getCategoryLabel = (category) => {
  if (category === 'Vegetable') {
    return 'Vegetables';
  }

  if (category === 'Fruit') {
    return 'Fruits';
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
          activeOpacity={0.85}
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
    paddingHorizontal: 2,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  activeTab: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  activeLabel: {
    color: theme.colors.primaryDark,
  },
});
