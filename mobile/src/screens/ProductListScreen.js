import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient, getApiErrorMessage } from '../api/client';
import CategoryTabs from '../components/CategoryTabs';
import { theme } from '../constants/theme';
import { DUMMY_PRODUCTS } from '../data/dummyProducts';

const TAG_CONFIG = {
  bestseller: { label: '\u2B50 Bestseller', backgroundColor: '#FFF3E0', color: '#E65100' },
  organic: { label: '\uD83C\uDF31 Organic', backgroundColor: '#E8F5E9', color: '#2E7D32' },
  seasonal: { label: '\uD83C\uDF42 Seasonal', backgroundColor: '#E3F2FD', color: '#1565C0' },
  new: { label: '\u2728 New', backgroundColor: '#FCE4EC', color: '#880E4F' },
  premium: { label: '\uD83D\uDC8E Premium', backgroundColor: '#EDE7F6', color: '#4527A0' },
};

export default function ProductListScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

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

  const filteredProducts = useMemo(
    () =>
      category === 'All'
        ? products
        : products.filter((product) => product.category === category),
    [products, category]
  );

  const visibleProducts = useMemo(() => {
    if (!search.trim()) {
      return filteredProducts;
    }

    const query = search.trim().toLowerCase();
    return filteredProducts.filter((product) => product.name.toLowerCase().includes(query));
  }, [filteredProducts, search]);

  const handleOrderPress = (productId) => {
    navigation.navigate('Place Order', { productId });
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <LinearGradient colors={['#1B5E20', '#388E3C']} style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{'\uD83C\uDF3F GoVigi'}</Text>
        <Text style={styles.heroTitle}>{'Fresh Produce \uD83E\uDD66'}</Text>
        <Text style={styles.heroSubtitle}>{products.length} products available</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>{'\uD83D\uDD0D'}</Text>
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
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleOrderPress(item._id)}
              activeOpacity={0.75}
            >
              {item.tag ? (
                <View
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: TAG_CONFIG[item.tag].backgroundColor,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: TAG_CONFIG[item.tag].color }]}>
                    {TAG_CONFIG[item.tag].label}
                  </Text>
                </View>
              ) : null}

              <View
                style={[
                  styles.emojiCircle,
                  {
                    backgroundColor: `${item.color}22`,
                    borderColor: `${item.color}44`,
                  },
                ]}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>

              <Text style={styles.productName}>{item.name}</Text>
              <Text numberOfLines={2} style={styles.productDesc}>
                {item.description}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {'\u20B9'}
                  {item.price}
                </Text>
                <Text style={styles.unit}>/{item.unit}</Text>
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleOrderPress(item._id)}
                activeOpacity={0.75}
              >
                <Text style={styles.addBtnText}>+ Order</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>{'\uD83C\uDF31'}</Text>
              <Text style={styles.emptyTitle}>No products here yet</Text>
              <Text style={styles.emptyText}>
                Check back soon — fresh produce is on its way.
              </Text>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    margin: 6,
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  tagChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 10,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 36,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 17,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
  },
  unit: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 2,
  },
  addBtn: {
    backgroundColor: '#FF6F00',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
