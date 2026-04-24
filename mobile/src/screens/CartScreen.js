import { useNavigation } from '@react-navigation/native';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const navigation = useNavigation();
  const { items, subtotal, deliveryFee, total, updateQty, removeItem, clearCart, count } = useCart();

  const handleClear = async () => {
    try {
      await clearCart();
    } catch (_error) {
      Alert.alert('Unable to clear cart', 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>{`Cart (${count})`}</Text>
          <Text style={styles.subheading}>Review your produce before checkout.</Text>
        </View>
        {items.length ? (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.75}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add fresh produce from the catalogue to continue.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.product?._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View
                  style={[
                    styles.emojiCircle,
                    {
                      backgroundColor: `${item.product?.color || '#4CAF50'}22`,
                      borderColor: `${item.product?.color || '#4CAF50'}44`,
                    },
                  ]}
                >
                  <Text style={styles.emoji}>{item.product?.emoji || '🌿'}</Text>
                </View>

                <View style={styles.itemBody}>
                  <Text style={styles.itemName}>{item.product?.name}</Text>
                  <Text style={styles.itemMeta}>
                    {`${item.quantity} × ₹${item.product?.price} = ₹${(item.quantity * (item.product?.price || 0)).toFixed(0)}`}
                  </Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyLight} onPress={() => updateQty(item.product?._id, item.quantity - 1)} activeOpacity={0.75}>
                      <Text style={styles.qtyLightText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyDark} onPress={() => updateQty(item.product?._id, item.quantity + 1)} activeOpacity={0.75}>
                      <Text style={styles.qtyDarkText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeItem(item.product?._id)} activeOpacity={0.75}>
                      <Text style={styles.removeText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{`₹${subtotal.toFixed(0)}`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(0)}`}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{`₹${total.toFixed(0)}`}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')} activeOpacity={0.75}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subheading: {
    marginTop: 4,
    color: theme.colors.muted,
  },
  clearText: {
    color: theme.colors.ctaDark,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emojiCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emoji: {
    fontSize: 28,
  },
  itemBody: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemMeta: {
    color: theme.colors.muted,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  qtyLight: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7EAD9',
  },
  qtyLightText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  qtyDark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  qtyDarkText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  qtyNum: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  removeText: {
    fontSize: 18,
    marginLeft: 'auto',
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: theme.colors.muted,
  },
  summaryValue: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  checkoutBtn: {
    marginTop: 6,
    backgroundColor: theme.colors.cta,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
    lineHeight: 22,
  },
});
