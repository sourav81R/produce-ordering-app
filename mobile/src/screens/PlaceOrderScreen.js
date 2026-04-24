import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
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
import TextField from '../components/TextField';
import { theme } from '../constants/theme';
import { DUMMY_PRODUCTS } from '../data/dummyProducts';
import { formatDisplayDate, formatInputDate } from '../utils/date';

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
        setError(getApiErrorMessage(requestError, 'Showing demo produce while products load.'));
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
      Alert.alert('Order placed', 'Your produce order has been submitted successfully.');
      setQuantity('1');
      onOrderPlaced();
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Place Order</Text>
      <Text style={styles.subheading}>
        Choose a product, set the quantity, and schedule delivery for your store.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.card}>
        {loadingProducts ? (
          <Text style={styles.mutedText}>Loading products...</Text>
        ) : (
          <>
            <Text style={styles.label}>Product</Text>
            <View style={styles.productList}>
              {products.map((product) => {
                const isActive = selectedProduct === product._id;

                return (
                  <TouchableOpacity
                    key={product._id}
                      style={[styles.productOption, isActive && styles.activeProductOption]}
                    onPress={() => setSelectedProduct(product._id)}
                  >
                    <Text style={[styles.productOptionName, isActive && styles.activeProductText]}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productOptionMeta, isActive && styles.activeProductText]}>
                      {product.category} | Rs. {product.price}/{product.unit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.form}>
              <TextField
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="1"
              />

              <View style={styles.field}>
                <Text style={styles.label}>Delivery Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker((current) => !current)}
                >
                  <Text style={styles.dateInputText}>{formatDisplayDate(deliveryDate)}</Text>
                </TouchableOpacity>
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

              <PrimaryButton title="Place Order" onPress={handleSubmit} loading={submitting} />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 24,
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mutedText: {
    color: theme.colors.muted,
  },
  errorText: {
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  productList: {
    marginTop: 10,
    gap: 10,
  },
  productOption: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  activeProductOption: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  productOptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  productOptionMeta: {
    marginTop: 6,
    color: theme.colors.muted,
  },
  activeProductText: {
    color: '#ffffff',
  },
  form: {
    marginTop: 18,
    gap: 14,
  },
  field: {
    gap: 8,
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
  dateInputText: {
    color: theme.colors.text,
  },
});
