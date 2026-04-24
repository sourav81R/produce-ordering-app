import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import ProductTile from '../components/ProductTile';
import ScreenHeader from '../components/ScreenHeader';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';

export default function FavoritesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { favorites, favoriteIds, items, addItem, updateQty, toggleFavorite, fetchFavorites } =
    useCart();

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchFavorites();
    } finally {
      setRefreshing(false);
    }
  };

  const cartQuantityMap = items.reduce((accumulator, item) => {
    const productId = item.product?._id;

    if (productId) {
      accumulator[productId] = item.quantity;
    }

    return accumulator;
  }, {});

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <ScreenHeader
              eyebrow="Favorites"
              title="Save your fastest reorders"
              subtitle="Keep top-moving products one tap away for the next cart build."
            />
          </View>
        }
        renderItem={({ item }) => (
          <ProductTile
            product={item}
            isFavorite={favoriteIds.includes(item._id)}
            cartQty={cartQuantityMap[item._id] || 0}
            onToggleFavorite={async (product) => {
              try {
                await toggleFavorite(product);
              } catch (requestError) {
                Alert.alert(
                  'Unable to update favorite',
                  requestError.message || 'Please try again.'
                );
              }
            }}
            onAddToCart={async (product) => {
              try {
                await addItem(product._id, 1);
                Alert.alert('Added to cart', `${product.name} was added to your cart.`);
              } catch (requestError) {
                Alert.alert('Unable to add item', requestError.message || 'Please try again.');
              }
            }}
            onUpdateQty={async (productId, quantity) => {
              try {
                await updateQty(productId, quantity);
              } catch (requestError) {
                Alert.alert(
                  'Unable to update quantity',
                  requestError.message || 'Please try again.'
                );
              }
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            description="Browse the catalogue and tap the heart icon on products you want to save."
            style={styles.emptyState}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 28,
  },
  gridRow: {
    paddingHorizontal: 10,
  },
  emptyState: {
    width: '100%',
    marginTop: 80,
  },
});
