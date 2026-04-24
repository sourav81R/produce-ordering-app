import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient, getApiErrorMessage } from '../api/client';
import PrimaryButton from '../components/PrimaryButton';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatDisplayDate, formatInputDate } from '../utils/date';

let RazorpayCheckout;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (_error) {
  RazorpayCheckout = null;
}

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
        // Keep env fallback only.
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
    navigation.navigate('My Orders');
  };

  const handlePlaceOrder = async () => {
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (paymentMethod === 'wallet') {
        await apiClient.post('/orders', payload);
        await finalizeSuccess();
        return;
      }

      if (paymentMethod === 'cod') {
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
          color: '#2E7D32',
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
        setError(getApiErrorMessage(requestError, requestError.message || 'Unable to place the order.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Checkout</Text>
      <Text style={styles.subheading}>Confirm your produce items, schedule delivery, and choose payment.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryList}>
          {items.map((item) => (
            <View style={styles.summaryItem} key={item.product?._id}>
              <View>
                <Text style={styles.summaryName}>{item.product?.name}</Text>
                <Text style={styles.summaryMeta}>{`${item.quantity} × ₹${item.product?.price} / ${item.product?.unit}`}</Text>
              </View>
              <Text style={styles.summaryPrice}>{`₹${(item.quantity * (item.product?.price || 0)).toFixed(0)}`}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Delivery Date</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker((current) => !current)} activeOpacity={0.75}>
          <Text style={styles.dateText}>{formatDisplayDate(deliveryDate)}</Text>
        </TouchableOpacity>
        {showDatePicker ? (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        ) : null}

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentGrid}>
          {['cod', 'razorpay', 'wallet'].map((method) => {
            const disabled = method === 'wallet' && wallet.balance < total;
            return (
              <TouchableOpacity
                key={method}
                style={[styles.payCard, paymentMethod === method && styles.payCardActive, disabled && styles.payCardDisabled]}
                onPress={() => setPaymentMethod(method)}
                activeOpacity={0.75}
                disabled={disabled}
              >
                <Text style={styles.payCardTitle}>
                  {method === 'cod'
                    ? '💵 Cash on Delivery'
                    : method === 'razorpay'
                      ? '💳 Pay Online'
                      : `👛 Wallet\n₹${wallet.balance.toFixed(0)}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>{`₹${subtotal.toFixed(0)}`}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Delivery</Text>
            <Text style={styles.breakdownValue}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(0)}`}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
            <Text style={styles.breakdownTotalLabel}>Total</Text>
            <Text style={styles.breakdownTotalValue}>{`₹${total.toFixed(0)}`}</Text>
          </View>
        </View>

        <PrimaryButton title="Place Order" onPress={handlePlaceOrder} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    backgroundColor: theme.colors.background,
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
  errorText: {
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
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
  summaryName: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryMeta: {
    marginTop: 4,
    color: theme.colors.muted,
  },
  summaryPrice: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  dateInput: {
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  dateText: {
    color: theme.colors.text,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  payCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  payCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceSoft,
  },
  payCardDisabled: {
    opacity: 0.55,
  },
  payCardTitle: {
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 20,
  },
  breakdown: {
    gap: 10,
    paddingTop: 6,
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
    fontWeight: '700',
    color: theme.colors.text,
  },
  breakdownTotal: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  breakdownTotalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  breakdownTotalValue: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.colors.primary,
  },
});
