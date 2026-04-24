import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiClient, getApiErrorMessage } from '../api/client';
import CategoryTabs from '../components/CategoryTabs';
import ProductTile from '../components/ProductTile';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { DUMMY_PRODUCTS } from '../data/dummyProducts';

export default function ProductListScreen() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const { items, favoriteIds, addItem, updateQty, toggleFavorite } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiClient.get('/products');
        const data = Array.isArray(response.data?.products)
          ? response.data.products
          : Array.isArray(response.data)
            ? response.data
            : [];

        setProducts(data.length ? data : DUMMY_PRODUCTS);
        setNotice(data.length ? '' : 'Showing demo produce while the live catalogue catches up.');
      } catch (requestError) {
        setProducts(DUMMY_PRODUCTS);
        setNotice(getApiErrorMessage(requestError, 'Showing demo produce while products load.'));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    let nextProducts = category === 'All'
      ? products
      : products.filter((product) => product.category === category);

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      nextProducts = nextProducts.filter((product) => product.name.toLowerCase().includes(query));
    }

    return nextProducts;
  }, [category, products, search]);

  const cartQtyFor = (productId) =>
    items.find((item) => item.product?._id === productId)?.quantity || 0;

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
      <LinearGradient colors={['#1B5E20', '#388E3C']} style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>🌿 GoVigi</Text>
        <Text style={styles.heroTitle}>Fresh Produce 🥦</Text>
        <Text style={styles.heroSubtitle}>{products.length} products available</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search produce..."
          placeholderTextColor="#AAAAAA"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <CategoryTabs activeCategory={category} onChange={setCategory} />

      {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
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
              cartQty={cartQtyFor(item._id)}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
              onUpdateQty={handleUpdateQty}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>No products here yet</Text>
              <Text style={styles.emptyText}>Check back soon — fresh produce is on its way.</Text>
            </View>
          }
        />
      )}
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
    gap: 16,
  },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    gap: 8,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    marginLeft: 10,
  },
  noticeText: {
    marginHorizontal: 16,
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontWeight: '600',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 28,
  },
  gridRow: {
    paddingHorizontal: 10,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
