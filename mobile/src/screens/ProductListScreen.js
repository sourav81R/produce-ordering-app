import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { apiClient, getApiErrorMessage } from '../api/client';
import CategoryTabs from '../components/CategoryTabs';
import { theme } from '../constants/theme';

export default function ProductListScreen() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Veg');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiClient.get('/products');
        setProducts(response.data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Unable to load products.'));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.category === category),
    [products, category]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Product List</Text>
      <Text style={styles.subheading}>Browse produce and switch categories using the tabs.</Text>

      <CategoryTabs activeCategory={category} onChange={setCategory} />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>
                {item.category} | ${item.price}/{item.unit}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products available in this category yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subheading: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    gap: 12,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  productMeta: {
    marginTop: 8,
    color: theme.colors.muted,
  },
  errorText: {
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 18,
  },
});
