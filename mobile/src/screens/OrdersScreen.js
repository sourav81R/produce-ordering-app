import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, getApiErrorMessage } from '../api/client';
import EmptyState from '../components/EmptyState';
import InlineMessage from '../components/InlineMessage';
import LoadingState from '../components/LoadingState';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import TabSectionNav from '../components/TabSectionNav';
import { theme } from '../constants/theme';
import { formatDisplayDate } from '../utils/date';
import { formatCurrency } from '../utils/format';

const getDisplayStatus = (order) => (order.cancelledAt ? 'Cancelled' : order.status);
const getCategoryIcon = (category) =>
  category === 'Fruit' ? 'nutrition-outline' : 'leaf-outline';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = async (mode = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const response = await apiClient.get('/orders');
      const nextOrders = Array.isArray(response.data?.orders)
        ? response.data.orders
        : Array.isArray(response.data)
          ? response.data
          : [];
      setOrders(nextOrders);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load orders.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const metrics = useMemo(
    () => ({
      total: orders.length,
      open: orders.filter((order) => !order.cancelledAt && order.status !== 'Delivered').length,
      delivered: orders.filter((order) => order.status === 'Delivered').length,
    }),
    [orders]
  );

  const activeOrder = useMemo(
    () => orders.find((order) => !order.cancelledAt && order.status !== 'Delivered') || null,
    [orders]
  );

  const handleCancel = async (orderId) => {
    try {
      await apiClient.post(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled from the GoVigi mobile app',
      });
      await loadOrders('refresh');
    } catch (requestError) {
      Alert.alert('Unable to cancel order', getApiErrorMessage(requestError, 'Please try again.'));
    }
  };

  if (loading) {
    return <LoadingState label="Loading your orders..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <LinearGradient colors={['#FFFFFF', '#FFF8DD']} style={styles.heroCard}>
              <ScreenHeader
                eyebrow="Order operations"
                title="Track every wholesale order"
                subtitle="See delivery status, payment details, and order history in one place."
              />

              <View style={styles.metricsRow}>
                <SectionCard style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Total</Text>
                  <Text style={styles.metricValue}>{metrics.total}</Text>
                </SectionCard>
                <SectionCard style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Open</Text>
                  <Text style={styles.metricValue}>{metrics.open}</Text>
                </SectionCard>
                <SectionCard style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Delivered</Text>
                  <Text style={styles.metricValue}>{metrics.delivered}</Text>
                </SectionCard>
              </View>

              {activeOrder ? (
                <SectionCard style={styles.highlightCard}>
                  <View style={styles.highlightCopy}>
                    <Text style={styles.highlightTag}>Active delivery</Text>
                    <Text style={styles.highlightTitle}>
                      {`Order #${activeOrder._id.slice(-8).toUpperCase()}`}
                    </Text>
                    <Text style={styles.highlightSubtitle}>
                      {`Expected ${formatDisplayDate(activeOrder.deliveryDate)} | Payment ${activeOrder.paymentStatus}`}
                    </Text>
                  </View>
                  <StatusBadge status={getDisplayStatus(activeOrder)} />
                </SectionCard>
              ) : null}
            </LinearGradient>
            <TabSectionNav />

            <InlineMessage message={error} tone="danger" />
          </View>
        }
        renderItem={({ item }) => (
          <SectionCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderCopy}>
                <Text style={styles.orderId}>{`Order #${item._id.slice(-8).toUpperCase()}`}</Text>
                <Text style={styles.orderMeta}>Placed on {formatDisplayDate(item.createdAt)}</Text>
              </View>
              <StatusBadge status={getDisplayStatus(item)} />
            </View>

            <View style={styles.itemsList}>
              {item.items?.map((orderItem) => (
                <View
                  style={styles.orderItem}
                  key={`${item._id}-${orderItem.product?._id || orderItem.name}`}
                >
                  <View style={styles.orderIcon}>
                    <Ionicons
                      name={getCategoryIcon(orderItem.category)}
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.orderItemCopy}>
                    <Text style={styles.orderItemName}>{orderItem.name}</Text>
                    <Text style={styles.orderItemMeta}>
                      {`${orderItem.quantity} x ${formatCurrency(orderItem.price)} / ${orderItem.unit}`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Delivery</Text>
                <Text style={styles.infoValue}>{formatDisplayDate(item.deliveryDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment</Text>
                <Text style={styles.infoValue}>
                  {`${item.paymentMethod.toUpperCase()} | ${item.paymentStatus}`}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total</Text>
                <Text style={styles.infoValue}>{formatCurrency(item.totalAmount)}</Text>
              </View>
            </View>

            {item.cancelReason ? (
              <InlineMessage message={`Cancellation reason: ${item.cancelReason}`} tone="warning" />
            ) : null}

            {!item.cancelledAt && item.status !== 'Delivered' ? (
              <PrimaryButton
                title="Cancel order"
                onPress={() => handleCancel(item._id)}
                variant="secondary"
                icon="close-circle-outline"
              />
            ) : null}
          </SectionCard>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No orders yet"
            description="Place your first order from the catalogue and it will show up here."
            style={styles.emptyState}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadOrders('refresh')}
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
  listContent: {
    paddingBottom: 110,
    gap: 12,
  },
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
    ...theme.shadows.card,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  highlightCard: {
    gap: 12,
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  highlightCopy: {
    gap: 8,
  },
  highlightTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  highlightTitle: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  highlightSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 21,
  },
  metricLabel: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    marginHorizontal: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  orderMeta: {
    color: theme.colors.muted,
  },
  itemsList: {
    gap: 10,
  },
  orderItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  orderItemCopy: {
    flex: 1,
    gap: 2,
  },
  orderItemName: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  orderItemMeta: {
    color: theme.colors.muted,
  },
  infoGrid: {
    gap: 10,
    paddingTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    color: theme.colors.subtle,
    fontWeight: '600',
  },
  infoValue: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 24,
  },
});
