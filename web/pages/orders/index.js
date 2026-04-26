import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';
import { formatDisplayDate } from '../../lib/date';
import { getRequestErrorMessage } from '../../lib/errors';

const getDisplayStatus = (order) => (order.cancelledAt ? 'Cancelled' : order.status);

export default function MyOrdersPage() {
  const { checkingAuth } = useRequireAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await apiClient.get('/orders');
        const nextOrders = Array.isArray(response.data?.orders)
          ? response.data.orders
          : Array.isArray(response.data)
            ? response.data
            : [];
        setOrders(nextOrders);
      } catch (requestError) {
        setError(getRequestErrorMessage(requestError, 'Unable to load your orders.'));
      } finally {
        setLoading(false);
      }
    };

    if (!checkingAuth) {
      loadOrders();
    }
  }, [checkingAuth]);

  const metrics = useMemo(
    () => ({
      total: orders.length,
      active: orders.filter((order) => !order.cancelledAt && order.status !== 'Delivered').length,
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
      const response = await apiClient.post(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled from the AgriOrder B2B web portal',
      });
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? { ...order, ...response.data?.order } : order))
      );
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to cancel this order.'));
    }
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Order Tracking | AgriOrder B2B</title>
      </Head>

      <div className="orders-dashboard">
        <div className="orders-dashboard-header">
          <div>
            <p className="auth-section-kicker">Order operations</p>
            <h1>Track every wholesale order</h1>
            <p>
              Monitor confirmation, delivery dates, payment status, and retailer order history from
              one clean workspace.
            </p>
          </div>
        </div>

        {error ? <p className="alert error">{error}</p> : null}

        <div className="orders-dashboard-metrics">
          <div className="orders-metric-card">
            <span>Total orders</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="orders-metric-card">
            <span>Active deliveries</span>
            <strong>{metrics.active}</strong>
          </div>
          <div className="orders-metric-card">
            <span>Delivered</span>
            <strong>{metrics.delivered}</strong>
          </div>
        </div>

        {activeOrder ? (
          <section className="orders-highlight-card">
            <div className="orders-highlight-copy">
              <span className="orders-highlight-tag">Active delivery</span>
              <h2>{`Order #${activeOrder._id.slice(-8).toUpperCase()}`}</h2>
              <p>
                {`Expected delivery ${formatDisplayDate(activeOrder.deliveryDate)}. Payment status: ${
                  activeOrder.paymentStatus
                }.`}
              </p>
            </div>
            <StatusBadge status={getDisplayStatus(activeOrder)} />
          </section>
        ) : null}

        <section className="orders-history-card">
          <div className="orders-history-head">
            <h2>Order history</h2>
            <p>Revisit previous orders and manage live ones.</p>
          </div>

          {loading ? (
            <p className="muted-text">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="muted-text">No orders yet. Browse the catalog and place your first order.</p>
          ) : (
            <div className="orders-history-grid">
              {orders.map((order) => (
                <article className="orders-history-item" key={order._id}>
                  <div className="orders-history-top">
                    <div>
                      <h3>{`Order #${order._id.slice(-8).toUpperCase()}`}</h3>
                      <p>{`Placed ${formatDisplayDate(order.createdAt)}`}</p>
                    </div>
                    <StatusBadge status={getDisplayStatus(order)} />
                  </div>

                  <div className="orders-history-lines">
                    {order.items?.map((item) => (
                      <div
                        className="orders-history-line"
                        key={`${order._id}-${item.product?._id || item.name}`}
                      >
                        <strong>{item.name}</strong>
                        <span>{`${item.quantity} x Rs ${item.price} / ${item.unit}`}</span>
                      </div>
                    ))}
                  </div>

                  <dl className="orders-history-meta">
                    <div>
                      <dt>Delivery</dt>
                      <dd>{formatDisplayDate(order.deliveryDate)}</dd>
                    </div>
                    <div>
                      <dt>Payment</dt>
                      <dd>{order.paymentMethod}</dd>
                    </div>
                    <div>
                      <dt>Payment status</dt>
                      <dd>{order.paymentStatus}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd>{`Rs ${order.totalAmount?.toFixed?.(0) || order.totalAmount}`}</dd>
                    </div>
                  </dl>

                  {order.cancelReason ? (
                    <p className="orders-history-note">{`Cancellation reason: ${order.cancelReason}`}</p>
                  ) : null}

                  {!order.cancelledAt && order.status !== 'Delivered' ? (
                    <button
                      className="button secondary small"
                      type="button"
                      onClick={() => handleCancel(order._id)}
                    >
                      Cancel order
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
