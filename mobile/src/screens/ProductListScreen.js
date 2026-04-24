import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { apiClient, getApiErrorMessage } from '../api/client';
import CategoryTabs from '../components/CategoryTabs';
import EmptyState from '../components/EmptyState';
import InlineMessage from '../components/InlineMessage';
import LoadingState from '../components/LoadingState';
import ProductTile from '../components/ProductTile';
import ScreenHeader from '../components/ScreenHeader';
import SearchField from '../components/SearchField';
import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { DUMMY_PRODUCTS } from '../data/dummyProducts';

const normalizeProducts = (payload) =>
  Array.isArray(payload?.products) ? payload.products : Array.isArray(payload) ? payload : [];

export default function ProductListScreen() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const { items, favoriteIds, addItem, updateQty, toggleFavorite } = useCart();

  const loadProducts = useCallback(async (mode = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await apiClient.get('/products');
      const data = normalizeProducts(response.data);
      setProducts(data.length ? data : DUMMY_PRODUCTS);
      setNotice(data.length ? '' : 'Showing demo products while the live catalogue catches up.');
    } catch (requestError) {
      setProducts(DUMMY_PRODUCTS);
      setNotice(getApiErrorMessage(requestError, 'Showing demo products while products load.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const counts = useMemo(
    () => ({
      all: products.length,
      vegetables: products.filter((product) => product.category === 'Vegetable').length,
      fruits: products.filter((product) => product.category === 'Fruit').length,
    }),
    [products]
  );

  const visibleProducts = useMemo(() => {
    let nextProducts =
      category === 'All'
        ? products
        : products.filter((product) => product.category === category);

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      nextProducts = nextProducts.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    }

    return nextProducts;
  }, [category, products, search]);

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

  const handleAddToCart = async (product) => {
    try {
      await addItem(product._id, 1);
      Alert.alert('Added to cart', `${product.name} was added to your produce cart.`);
    } catch (requestError) {
      Alert.alert('Unable to add item', getApiErrorMessage(requestError, 'Please try again.'));
    }
  };

  const handleUpdateQty = async (productId, quantity) => {
    try {
      await updateQty(productId, quantity);
    } catch (requestError) {
      Alert.alert('Unable to update quantity', getApiErrorMessage(requestError, 'Please try again.'));
    }
  };

  const handleToggleFavorite = async (product) => {
    try {
      await toggleFavorite(product);
    } catch (requestError) {
      Alert.alert('Unable to update favorite', getApiErrorMessage(requestError, 'Please try again.'));
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <LinearGradient colors={['#244F24', '#6A963F']} style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Retail catalogue</Text>
        <Text style={styles.heroTitle}>Fresh stock for your next order run</Text>
        <Text style={styles.heroSubtitle}>
          Browse vegetables and fruits, save favorites, and add items to cart in seconds.
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <Ionicons name="layers-outline" size={14} color={theme.colors.white} />
            <Text style={styles.statText}>{counts.all} items</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="leaf-outline" size={14} color={theme.colors.white} />
            <Text style={styles.statText}>{counts.vegetables} vegetables</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="nutrition-outline" size={14} color={theme.colors.white} />
            <Text style={styles.statText}>{counts.fruits} fruits</Text>
          </View>
        </View>
      </LinearGradient>

      <SectionCard style={styles.toolbarCard}>
        <ScreenHeader
          eyebrow="Browse"
          title="Find the right produce fast"
          subtitle="Search by name or filter by category to narrow the list."
        />
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search tomatoes, mangoes, spinach..."
        />
        <CategoryTabs activeCategory={category} onChange={setCategory} />
      </SectionCard>

      <InlineMessage message={notice} tone="warning" />
    </View>
  );

  if (loading) {
    return <LoadingState label="Loading catalogue..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ProductTile
            product={item}
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
            title="No products match this filter"
            description="Try a different keyword or switch categories to widen your results."
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContent: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    gap: 10,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 22,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  statText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  toolbarCard: {
    gap: 14,
  },
  listContent: {
    paddingBottom: 28,
  },
  gridRow: {
    paddingHorizontal: 10,
  },
  emptyState: {
    width: '100%',
  },
});
