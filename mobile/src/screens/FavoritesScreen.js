import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import ProductTile from '../components/ProductTile';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';

export default function FavoritesScreen() {
  const { favorites, favoriteIds, items, addItem, updateQty, toggleFavorite } = useCart();

  const cartQtyFor = (productId) =>
    items.find((item) => item.product?._id === productId)?.quantity || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Favorites</Text>
      <Text style={styles.subheading}>Keep your best produce picks ready for quick reordering.</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>Browse the catalogue to save products.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProductTile
              product={item}
              isFavorite={favoriteIds.includes(item._id)}
              cartQty={cartQtyFor(item._id)}
              onToggleFavorite={async (product) => {
                try {
                  await toggleFavorite(product);
                } catch (requestError) {
                  Alert.alert('Unable to update favorite', requestError.message || 'Please try again.');
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
                  Alert.alert('Unable to update quantity', requestError.message || 'Please try again.');
                }
              }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: 16,
  },
  subheading: {
    color: theme.colors.muted,
    lineHeight: 22,
    marginTop: 4,
    marginHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  gridRow: {
    paddingHorizontal: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptyText: {
    marginTop: 8,
    color: theme.colors.muted,
    textAlign: 'center',
  },
});
