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
      <LinearGradient
        colors={['#064E3B', '#059669', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Open for Orders</Text>
          </View>
          <Ionicons name="leaf" size={20} color="rgba(255,255,255,0.6)" />
        </View>

        <View style={styles.heroMain}>
          <Text style={styles.heroTitle}>Fresh Harvest,{'\n'}Direct to You</Text>
          <Text style={styles.heroSubtitle}>
            Premium quality produce sourced daily from local organic farms.
          </Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>{counts.vegetables} Veggies</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>{counts.fruits} Fruits</Text>
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
    padding: 24,
    gap: 20,
    elevation: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroMain: {
    gap: 8,
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
