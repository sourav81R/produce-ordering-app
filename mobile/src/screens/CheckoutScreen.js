import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiClient, getApiErrorMessage } from '../api/client';
import EmptyState from '../components/EmptyState';
import InlineMessage from '../components/InlineMessage';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatDisplayDate, formatInputDate } from '../utils/date';
import { formatCurrency } from '../utils/format';

let RazorpayCheckout;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (_error) {
  RazorpayCheckout = null;
}

const paymentMethods = [
  {
    key: 'cod',
    title: 'Cash on delivery',
    subtitle: 'Pay once the order arrives at your store.',
    icon: 'cash-outline',
  },
  {
    key: 'razorpay',
    title: 'Pay online',
    subtitle: 'Use Razorpay to confirm the order immediately.',
    icon: 'card-outline',
  },
  {
    key: 'wallet',
    title: 'Wallet',
    subtitle: 'Use available store credit first.',
    icon: 'wallet-outline',
  },
];

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, total, wallet, clearCart, fetchWallet } = useCart();
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentKey, setPaymentKey] = useState(process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPaymentConfig = async () => {
      try {
        const response = await apiClient.get('/orders/payment-config');
        if (!paymentKey) {
          setPaymentKey(response.data?.keyId || '');
        }
      } catch (_error) {
        // Use environment fallback when the config request fails.
      }
    };

    loadPaymentConfig();
    fetchWallet();
  }, []);

  const payload = useMemo(
    () => ({
      items: items.map((item) => ({
        productId: item.product?._id,
        quantity: item.quantity,
      })),
      deliveryDate: formatInputDate(deliveryDate),
      paymentMethod,
    }),
    [deliveryDate, items, paymentMethod]
  );

  const handleDateChange = (_event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDeliveryDate(selectedDate);
    }
  };

  const finalizeSuccess = async () => {
    await clearCart();
    await fetchWallet();
    navigation.navigate('Home', { screen: 'My Orders' });
  };

  const handlePlaceOrder = async () => {
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (paymentMethod === 'wallet' || paymentMethod === 'cod') {
        await apiClient.post('/orders', payload);
        await finalizeSuccess();
        return;
      }

      if (!RazorpayCheckout) {
        throw new Error('Razorpay native module is not installed in this mobile build yet.');
      }

      if (!paymentKey) {
        throw new Error('Razorpay key is missing from mobile environment configuration.');
      }

      const response = await apiClient.post('/orders', payload);
      const options = {
        key: paymentKey,
        amount: response.data?.amount?.toString?.() || '0',
        currency: response.data?.currency || 'INR',
        order_id: response.data?.razorpayOrderId,
        name: 'GoVigi Produce',
        description: 'Fresh produce order',
        prefill: {
          email: user?.email || '',
          name: user?.name || '',
        },
        theme: {
          color: theme.colors.primary,
        },
      };

      const paymentData = await RazorpayCheckout.open(options);
      await apiClient.post('/orders/verify-payment', {
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
      });
      await finalizeSuccess();
    } catch (requestError) {
      if (requestError?.code !== 'PAYMENT_CANCELLED') {
        setError(
          getApiErrorMessage(requestError, requestError.message || 'Unable to place the order.')
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <View style={styles.emptyWrap}>
        <ScreenHeader
          eyebrow="Checkout"
          title="Nothing to check out yet"
          subtitle="Return to the catalogue, add items to cart, and come back here to place your order."
        />
        <EmptyState
          icon="bag-handle-outline"
          title="Your cart is empty"
          description="Order summary and payment options will appear here after you add products."
          style={styles.emptyState}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader
        eyebrow="Checkout"
        title="Confirm delivery and payment"
        subtitle="Review line items, choose a delivery date, and place the order."
      />

      <InlineMessage message={error} tone="danger" />

      <SectionCard style={styles.card}>
        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.summaryList}>
          {items.map((item) => (
            <View style={styles.summaryItem} key={item.product?._id}>
              <View style={styles.summaryItemCopy}>
                <Text style={styles.summaryName}>{item.product?.name}</Text>
                <Text style={styles.summaryMeta}>
                  {`${item.quantity} x ${formatCurrency(item.product?.price)} / ${item.product?.unit}`}
                </Text>
              </View>
              <Text style={styles.summaryPrice}>
                {formatCurrency(item.quantity * (item.product?.price || 0))}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery date</Text>
        <Pressable
          style={styles.dateInput}
          onPress={() => setShowDatePicker((current) => !current)}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.dateText}>{formatDisplayDate(deliveryDate)}</Text>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        ) : null}
      </SectionCard>

      <SectionCard style={styles.card}>
        <View style={styles.paymentHeader}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <View style={styles.walletChip}>
            <Ionicons name="wallet-outline" size={14} color={theme.colors.primaryDark} />
            <Text style={styles.walletChipText}>{formatCurrency(wallet.balance)}</Text>
          </View>
        </View>

        <View style={styles.paymentList}>
          {paymentMethods.map((method) => {
            const disabled = method.key === 'wallet' && wallet.balance < total;
            const active = paymentMethod === method.key;

            return (
              <Pressable
                key={method.key}
                style={[
                  styles.paymentCard,
                  active && styles.paymentCardActive,
                  disabled && styles.paymentCardDisabled,
                ]}
                onPress={() => setPaymentMethod(method.key)}
                disabled={disabled}
              >
                <View style={[styles.paymentIcon, active && styles.paymentIconActive]}>
                  <Ionicons
                    name={method.icon}
                    size={18}
                    color={active ? theme.colors.white : theme.colors.primary}
                  />
                </View>
                <View style={styles.paymentCopy}>
                  <Text style={styles.paymentTitle}>{method.title}</Text>
                  <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
                </View>
                {active ? (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard style={styles.card}>
        <Text style={styles.sectionTitle}>Cost breakdown</Text>
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
          title="Place order"
          onPress={handlePlaceOrder}
          loading={submitting}
          icon="checkmark-done-outline"
        />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    backgroundColor: theme.colors.background,
  },
  emptyWrap: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
    gap: 18,
  },
  emptyState: {
    flex: 1,
  },
  card: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
  },
  summaryList: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryItemCopy: {
    flex: 1,
    gap: 4,
  },
  summaryName: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryMeta: {
    color: theme.colors.muted,
  },
  summaryPrice: {
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  dateInput: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAccent,
  },
  dateText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  walletChipText: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  paymentList: {
    gap: 10,
  },
  paymentCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
  },
  paymentCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  paymentCardDisabled: {
    opacity: 0.55,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSoft,
  },
  paymentIconActive: {
    backgroundColor: theme.colors.primary,
  },
  paymentCopy: {
    flex: 1,
    gap: 2,
  },
  paymentTitle: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  paymentSubtitle: {
    color: theme.colors.muted,
    lineHeight: 19,
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
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  breakdownTotalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  breakdownTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
});
