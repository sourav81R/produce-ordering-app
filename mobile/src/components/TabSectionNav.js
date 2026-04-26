import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';

const TAB_ITEMS = [
  { route: 'Products', icon: 'leaf-outline', activeIcon: 'leaf', label: 'Products' },
  { route: 'Cart', icon: 'cart-outline', activeIcon: 'cart', label: 'Cart' },
  { route: 'Favorites', icon: 'heart-outline', activeIcon: 'heart', label: 'Favorites' },
  { route: 'My Orders', icon: 'receipt-outline', activeIcon: 'receipt', label: 'My Orders' },
];

export default function TabSectionNav({ style }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { count } = useCart();

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.shell, style]}>
      <View style={styles.row}>
        {TAB_ITEMS.map((item) => {
          const active = route.name === item.route;

          return (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route)}
              style={[styles.tab, active && styles.activeTab]}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={26}
                color={active ? theme.colors.primary : theme.colors.subtle}
              />
              <Text style={[styles.tabText, active && styles.activeTabText]}>{item.label}</Text>
            </Pressable>
          );
        })}

        <Pressable onPress={() => navigation.navigate('Cart')} style={styles.cartCta}>
          <Text style={styles.cartCtaText}>{count > 0 ? `View Cart (${count})` : 'View Cart'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
    ...theme.shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  tab: {
    flex: 1,
    minHeight: 82,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#F5FBF6',
  },
  tabText: {
    color: theme.colors.subtle,
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  cartCta: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFF8D6',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cartCtaText: {
    color: theme.colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
});
