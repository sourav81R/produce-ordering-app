import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient, getApiErrorMessage } from '../api/client';
import CategoryTabs from '../components/CategoryTabs';
import EmptyState from '../components/EmptyState';
import InlineMessage from '../components/InlineMessage';
import LoadingState from '../components/LoadingState';
import ProductTile from '../components/ProductTile';
import SearchField from '../components/SearchField';
import SectionCard from '../components/SectionCard';
import TabSectionNav from '../components/TabSectionNav';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { DUMMY_PRODUCTS } from '../data/dummyProducts';
import { formatCompactCurrency } from '../utils/format';

const SORT_OPTIONS = [
  { key: 'featured', label: 'Featured' },
  { key: 'fast', label: 'Fast delivery' },
  { key: 'stock', label: 'Stock' },
  { key: 'price-asc', label: 'Low price' },
  { key: 'price-desc', label: 'High price' },
];

const normalizeProductsResponse = (payload) => {
  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const sortProducts = (products, sortBy) => {
  if (sortBy === 'price-asc') {
    return [...products].sort((first, second) => first.price - second.price);
  }

  if (sortBy === 'price-desc') {
    return [...products].sort((first, second) => second.price - first.price);
  }

  if (sortBy === 'fast') {
    return [...products].sort((first, second) =>
      (first.deliveryWindow || '').localeCompare(second.deliveryWindow || '')
    );
  }

  if (sortBy === 'stock') {
    return [...products].sort((first, second) => (second.stockLevel || 0) - (first.stockLevel || 0));
  }

  return [...products].sort((first, second) => {
    const firstScore = (first.tag ? 2 : 0) + (first.stockLevel || 0);
    const secondScore = (second.tag ? 2 : 0) + (second.stockLevel || 0);
    return secondScore - firstScore;
  });
};

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [error, setError] = useState('');
  const {
    items,
    favoriteIds,
    favorites,
    count,
    total,
    addItem,
    updateQty,
    toggleFavorite,
  } = useCart();

  const loadProducts = useCallback(async (mode = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const response = await apiClient.get('/products');
      const nextProducts = normalizeProductsResponse(response.data);
      setProducts(nextProducts.length ? nextProducts : DUMMY_PRODUCTS);
    } catch (requestError) {
      setProducts(DUMMY_PRODUCTS);
      setError(getApiErrorMessage(requestError, 'Showing demo products while the catalogue loads.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const cartQuantityMap = useMemo(
    () =>
      items.reduce((accumulator, item) => {
        const productId = item.product?._id;

        if (productId) {
          accumulator[productId] = item.quantity;
        }

        return accumulator;
      }, {}),
    [items]
  );

  const filteredProducts = useMemo(() => {
    let nextProducts = products;

    if (activeCategory !== 'All') {
      nextProducts = nextProducts.filter((product) => product.category === activeCategory);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      nextProducts = nextProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.supplier?.toLowerCase().includes(query) ||
          product.origin?.toLowerCase().includes(query)
      );
    }

    return sortProducts(nextProducts, sortBy);
  }, [activeCategory, products, search, sortBy]);

  const counts = useMemo(
    () => ({
      all: products.length,
      vegetables: products.filter((product) => product.category === 'Vegetable').length,
      fruits: products.filter((product) => product.category === 'Fruit').length,
    }),
    [products]
  );

  const stats = useMemo(
    () => ({
      products: products.length,
      fast: products.filter((product) => /15|20|25|30/.test(product.deliveryWindow || '')).length,
      organic: products.filter((product) => product.isOrganic).length,
    }),
    [products]
  );

  const handleToggleFavorite = async (product) => {
    try {
      await toggleFavorite(product);
    } catch (requestError) {
      Alert.alert('Unable to update favorite', requestError.message || 'Please try again.');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addItem(product._id, product.minOrderQty || 1);
    } catch (requestError) {
      Alert.alert('Unable to add item', requestError.message || 'Please try again.');
    }
  };

  const handleUpdateQty = async (productId, quantity) => {
    try {
      await updateQty(productId, quantity);
    } catch (requestError) {
      Alert.alert('Unable to update quantity', requestError.message || 'Please try again.');
    }
  };

  if (loading) {
    return <LoadingState label="Loading the fresh catalogue..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <LinearGradient
              colors={['#FFFFFF', '#FFF9E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroBadge}>
                <Ionicons name="flash-outline" size={14} color={theme.colors.primaryDark} />
                <Text style={styles.heroBadgeText}>Delivery in minutes</Text>
              </View>
              <Text style={styles.heroTitle}>
                Fresh fruits and vegetables with a cleaner mobile storefront.
              </Text>
              <Text style={styles.heroSubtitle}>
                Search quickly, sort smartly, and build your next order with fewer taps.
              </Text>

              <View style={styles.metricRow}>
                <View style={styles.metricPill}>
                  <Text style={styles.metricValue}>{stats.products}</Text>
                  <Text style={styles.metricLabel}>Products</Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricValue}>{stats.fast}</Text>
                  <Text style={styles.metricLabel}>Fast picks</Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricValue}>{stats.organic}</Text>
                  <Text style={styles.metricLabel}>Organic</Text>
                </View>
              </View>

              <View style={styles.heroFooter}>
                <View style={styles.heroFooterChip}>
                  <Ionicons name="cart-outline" size={15} color={theme.colors.primaryDark} />
                  <Text style={styles.heroFooterText}>{`${count} items in cart`}</Text>
                </View>
                <View style={styles.heroFooterChip}>
                  <Ionicons name="heart-outline" size={15} color={theme.colors.primaryDark} />
                  <Text style={styles.heroFooterText}>{`${favoriteIds.length} saved`}</Text>
                </View>
                <View style={styles.heroFooterChip}>
                  <Ionicons name="cash-outline" size={15} color={theme.colors.primaryDark} />
                  <Text style={styles.heroFooterText}>{formatCompactCurrency(total || 0)}</Text>
                </View>
              </View>
            </LinearGradient>

            <TabSectionNav />

            <SectionCard style={styles.controlsCard}>
              <SearchField
                value={search}
                onChangeText={setSearch}
                placeholder="Search mango, cucumber, spinach..."
              />

              <CategoryTabs
                activeCategory={activeCategory}
                counts={counts}
                onChange={setActiveCategory}
              />

              <View style={styles.sortWrap}>
                <Text style={styles.sortHeading}>Sort by</Text>
                <View style={styles.sortRow}>
                  {SORT_OPTIONS.map((option) => {
                    const active = sortBy === option.key;

                    return (
                      <Pressable
                        key={option.key}
                        style={[styles.sortChip, active && styles.sortChipActive]}
                        onPress={() => setSortBy(option.key)}
                      >
                        <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </SectionCard>

            <ScreenStrip
              results={filteredProducts.length}
              search={search}
              category={activeCategory}
              favorites={favorites.length}
            />

            <InlineMessage message={error} tone="warning" />
          </View>
        }
        renderItem={({ item }) => (
          <ProductTile
            product={item}
            compact
            isFavorite={favoriteIds.includes(item._id)}
            cartQty={cartQuantityMap[item._id] || 0}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No products found"
            description="Try another search or switch categories to explore more fresh produce."
            style={styles.emptyState}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProducts('refresh')}
            tintColor={theme.colors.primary}
          />
        }
      />

      <Pressable
        onPress={() => navigation.navigate('Cart')}
        style={styles.floatingCartButton}
      >
        <Ionicons name="cart" size={18} color={theme.colors.white} />
        <Text style={styles.floatingCartText}>{count > 0 ? `Cart ${count}` : 'Cart'}</Text>
      </Pressable>
    </View>
  );
}

function ScreenStrip({ results, search, category, favorites }) {
  const descriptor = search.trim()
    ? `Results for "${search.trim()}"`
    : category === 'All'
      ? 'Showing the full catalogue'
      : `Browsing ${category.toLowerCase()} picks`;

  return (
    <View style={styles.stripRow}>
      <View style={styles.stripChip}>
        <Text style={styles.stripValue}>{results}</Text>
        <Text style={styles.stripLabel}>results</Text>
      </View>
      <View style={styles.stripChipWide}>
        <Text style={styles.stripDescriptor}>{descriptor}</Text>
        <Text style={styles.stripMeta}>{`${favorites} favorites ready for reorder`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: 112,
  },
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
  },
  heroBadgeText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 35,
  },
  heroSubtitle: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  metricPill: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 5,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  heroFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  heroFooterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFF2B8',
  },
  heroFooterText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  controlsCard: {
    gap: 16,
    padding: 16,
  },
  sortWrap: {
    gap: 10,
  },
  sortHeading: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  sortChipActive: {
    borderColor: '#F2D85D',
    backgroundColor: theme.colors.accentSoft,
  },
  sortChipText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  sortChipTextActive: {
    color: theme.colors.primaryDark,
  },
  stripRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stripChip: {
    minWidth: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  stripChipWide: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  stripValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  stripLabel: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stripDescriptor: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  stripMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  gridRow: {
    paddingHorizontal: 8,
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  floatingCartButton: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.primaryDark,
    ...theme.shadows.card,
  },
  floatingCartText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
