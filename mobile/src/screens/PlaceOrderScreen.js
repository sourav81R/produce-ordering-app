import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, getApiErrorMessage } from '../api/client';
import InlineMessage from '../components/InlineMessage';
import LoadingState from '../components/LoadingState';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import TextField from '../components/TextField';
import { theme } from '../constants/theme';
import { DUMMY_PRODUCTS } from '../data/dummyProducts';
import { formatDisplayDate, formatInputDate } from '../utils/date';
import { formatCurrency } from '../utils/format';

export default function PlaceOrderScreen({ onOrderPlaced, route }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const presetProductId = route?.params?.productId;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiClient.get('/products');
        const data = Array.isArray(response.data?.products)
          ? response.data.products
          : Array.isArray(response.data)
            ? response.data
            : [];
        const nextProducts = data.length ? data : DUMMY_PRODUCTS;

        setProducts(nextProducts);
        setSelectedProduct(presetProductId || nextProducts[0]?._id || '');
      } catch (requestError) {
        const nextProducts = DUMMY_PRODUCTS;

        setProducts(nextProducts);
        setSelectedProduct(presetProductId || nextProducts[0]?._id || '');
        setError(getApiErrorMessage(requestError, 'Showing demo products while products load.'));
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [presetProductId]);

  const handleSubmit = async () => {
    if (!selectedProduct) {
      setError('Please select a product before placing the order.');
      return;
    }

    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiClient.post('/orders', {
        product: selectedProduct,
        quantity: Number(quantity),
        deliveryDate: formatInputDate(deliveryDate),
      });
      setQuantity('1');
      onOrderPlaced?.();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to place the order.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (_event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDeliveryDate(selectedDate);
    }
  };

  if (loadingProducts) {
    return <LoadingState label="Loading products..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader
        eyebrow="Manual order"
        title="Create a direct order"
        subtitle="Pick a product, set quantity, and schedule the delivery date."
      />

      <InlineMessage message={error} tone="danger" />

      <SectionCard style={styles.card}>
        <Text style={styles.sectionTitle}>Choose product</Text>
        <View style={styles.productList}>
          {products.map((product) => {
            const isActive = selectedProduct === product._id;

            return (
              <Pressable
                key={product._id}
                style={[styles.productOption, isActive && styles.activeProductOption]}
                onPress={() => setSelectedProduct(product._id)}
              >
                <View style={styles.productOptionCopy}>
                  <Text style={[styles.productOptionName, isActive && styles.activeProductText]}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productOptionMeta, isActive && styles.activeProductText]}>
                    {`${product.category} • ${formatCurrency(product.price)} / ${product.unit}`}
                  </Text>
                </View>
                {isActive ? (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard style={styles.card}>
        <Text style={styles.sectionTitle}>Quantity and schedule</Text>
        <TextField
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="1"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Delivery date</Text>
          <Pressable style={styles.dateInput} onPress={() => setShowDatePicker((current) => !current)}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.dateInputText}>{formatDisplayDate(deliveryDate)}</Text>
          </Pressable>
        </View>

        {showDatePicker ? (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        ) : null}

        <PrimaryButton
          title="Place order"
          onPress={handleSubmit}
          loading={submitting}
          icon="checkmark-done-outline"
        />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: theme.colors.background,
  },
  card: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
  },
  productList: {
    gap: 10,
  },
  productOption: {
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  activeProductOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  productOptionCopy: {
    flex: 1,
    gap: 4,
  },
  productOptionName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  productOptionMeta: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  activeProductText: {
    color: theme.colors.white,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dateInput: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAccent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateInputText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});
