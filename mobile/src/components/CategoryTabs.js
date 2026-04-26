import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

const categories = ['All', 'Vegetable', 'Fruit'];

const getCategoryMeta = (category) => {
  if (category === 'Vegetable') {
    return {
      label: 'Vegetables',
      icon: 'leaf-outline',
      countKey: 'vegetables',
    };
  }

  if (category === 'Fruit') {
    return {
      label: 'Fruits',
      icon: 'nutrition-outline',
      countKey: 'fruits',
    };
  }

  return {
    label: 'All',
    icon: 'grid-outline',
    countKey: 'all',
  };
};

export default function CategoryTabs({ activeCategory, counts = {}, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        (() => {
          const meta = getCategoryMeta(category);
          const isActive = activeCategory === category;
          const count = counts[meta.countKey];

          return (
            <TouchableOpacity
              key={category}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onChange(category)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrap, isActive && styles.activeIconWrap]}>
                <Ionicons
                  name={meta.icon}
                  size={14}
                  color={isActive ? theme.colors.primaryDark : theme.colors.subtle}
                />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, isActive && styles.activeLabel]}>{meta.label}</Text>
                {typeof count === 'number' ? (
                  <Text style={[styles.count, isActive && styles.activeCount]}>{count} items</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })()
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
    minWidth: 126,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.soft,
  },
  activeTab: {
    backgroundColor: '#F2FBF6',
    borderColor: '#9ED9B5',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAccent,
  },
  activeIconWrap: {
    backgroundColor: theme.colors.primarySoft,
  },
  copy: {
    gap: 2,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  activeLabel: {
    color: theme.colors.primaryDark,
  },
  count: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '600',
  },
  activeCount: {
    color: theme.colors.primary,
  },
});
