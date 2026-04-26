import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import ProductThumbnail from '../components/ProductThumbnail';
import QuantityStepper from '../components/QuantityStepper';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import TabSectionNav from '../components/TabSectionNav';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

export default function CartScreen() {
  const navigation = useNavigation();
  const { items, subtotal, deliveryFee, total, updateQty, removeItem, clearCart, count } =
    useCart();

  const handleClear = async () => {
    try {
      await clearCart();
    } catch (_error) {
      Alert.alert('Unable to clear cart', 'Please try again.');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
    } catch (_error) {
      Alert.alert('Unable to remove item', 'Please try again.');
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    try {
      await updateQty(productId, quantity);
    } catch (_error) {
      Alert.alert('Unable to update quantity', 'Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <LinearGradient colors={['#FFFFFF', '#FFF8DD']} style={styles.emptyHero}>
          <ScreenHeader
            eyebrow="Cart"
            title="Your basket is ready when you are"
            subtitle="Add fresh produce from the catalogue and your pricing summary will build itself here."
          />
        </LinearGradient>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          description="Once you add products, pricing and checkout details will appear here."
          style={styles.emptyState}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product?._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <LinearGradient colors={['#FFFFFF', '#FFF7D6']} style={styles.heroCard}>
              <ScreenHeader
                eyebrow="Cart"
                title={`Review ${count} cart items`}
                subtitle="Adjust quantities, double-check pricing, and move into checkout when ready."
                right={
                  <Pressable onPress={handleClear} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear all</Text>
                  </Pressable>
                }
              />

              <View style={styles.summaryStrip}>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Subtotal</Text>
                  <Text style={styles.summaryMetricValue}>{formatCurrency(subtotal)}</Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Delivery</Text>
                  <Text style={styles.summaryMetricValue}>
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Total</Text>
                  <Text style={styles.summaryMetricValue}>{formatCurrency(total)}</Text>
                </View>
              </View>
            </LinearGradient>
            <TabSectionNav />
          </View>
        }
        renderItem={({ item }) => (
          <SectionCard style={styles.itemCard}>
            <ProductThumbnail
              product={item.product}
              style={styles.thumbnailFrame}
              imageStyle={styles.thumbnailImage}
              resizeMode="contain"
            />

            <View style={styles.itemBody}>
              <View style={styles.itemTopRow}>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{item.product?.name}</Text>
                  <Text style={styles.itemMeta}>
                    {`${formatCurrency(item.product?.price)} / ${item.product?.unit}`}
                  </Text>
                  <Text style={styles.itemMetaSecondary}>
                    {item.product?.packSize || item.product?.deliveryWindow || 'Fresh stock'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRemove(item.product?._id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                </Pressable>
              </View>

              <View style={styles.itemBottomRow}>
                <View>
                  <Text style={styles.lineTotalLabel}>Line total</Text>
                  <Text style={styles.lineTotal}>
                    {formatCurrency(item.quantity * (item.product?.price || 0))}
                  </Text>
                </View>
                <QuantityStepper
                  value={item.quantity}
                  onDecrease={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                  onIncrease={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                  compact
                />
              </View>
            </View>
          </SectionCard>
        )}
        ListFooterComponent={
          <SectionCard style={styles.checkoutCard}>
            <Text style={styles.checkoutTitle}>Checkout summary</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery fee</Text>
              <Text style={styles.breakdownValue}>
                {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
              </Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.breakdownTotalLabel}>Grand total</Text>
              <Text style={styles.breakdownTotalValue}>{formatCurrency(total)}</Text>
            </View>
            <PrimaryButton
              title="Proceed to checkout"
              onPress={() => navigation.navigate('Checkout')}
              icon="arrow-forward-outline"
            />
          </SectionCard>
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
  emptyWrap: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
    gap: 18,
  },
  emptyHero: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  emptyState: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  listContent: {
    paddingBottom: 110,
    gap: 12,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 18,
    ...theme.shadows.card,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearButtonText: {
    color: theme.colors.ctaDark,
    fontWeight: '700',
  },
  summaryStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryMetric: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  summaryMetricLabel: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryMetricValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  itemCard: {
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 14,
  },
  thumbnailFrame: {
    width: 92,
    height: 92,
    borderRadius: 20,
    backgroundColor: '#F4F2E9',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  itemBody: {
    flex: 1,
    gap: 14,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  itemMeta: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  itemMetaSecondary: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#F3D0CC',
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  lineTotalLabel: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  lineTotal: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  checkoutCard: {
    marginHorizontal: 16,
    gap: 14,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownLabel: {
    color: theme.colors.muted,
  },
  breakdownValue: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  breakdownTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  breakdownTotalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
  },
  breakdownTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
});
