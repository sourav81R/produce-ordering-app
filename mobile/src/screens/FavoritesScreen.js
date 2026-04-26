import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EmptyState from '../components/EmptyState';
import ProductTile from '../components/ProductTile';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import TabSectionNav from '../components/TabSectionNav';
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
            <LinearGradient colors={['#FFFFFF', '#FFF8DD']} style={styles.heroCard}>
              <ScreenHeader
                eyebrow="Favorites"
                title="Save your fastest reorders"
                subtitle="Keep top-moving products one tap away for the next cart build."
              />

              <SectionCard style={styles.miniStrip}>
                <View style={styles.miniMetric}>
                  <Text style={styles.miniValue}>{favorites.length}</Text>
                  <Text style={styles.miniLabel}>Saved items</Text>
                </View>
                <View style={styles.miniMetric}>
                  <Text style={styles.miniValue}>{Object.keys(cartQuantityMap).length}</Text>
                  <Text style={styles.miniLabel}>Already in cart</Text>
                </View>
                </SectionCard>
            </LinearGradient>
            <TabSectionNav />
          </View>
        }
        renderItem={({ item }) => (
          <ProductTile
            product={item}
            compact
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
  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
    ...theme.shadows.card,
  },
  miniStrip: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  miniMetric: {
    flex: 1,
    gap: 4,
  },
  miniValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  miniLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 110,
  },
  gridRow: {
    paddingHorizontal: 8,
  },
  emptyState: {
    width: '100%',
    marginHorizontal: 16,
    marginTop: 24,
  },
});
