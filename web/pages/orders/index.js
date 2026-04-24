import Head from 'next/head';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
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

  const handleCancel = async (orderId) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled from the GoVigi web portal',
      });
      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? { ...order, ...response.data?.order }
            : order
        )
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
        <title>My Orders | GoVigi Produce Ordering App</title>
      </Head>

      <div className="page-stack">
        <PageHeader
          title="My Orders"
          description="Track each produce order from placement through confirmation and delivery."
        />

        <div className="card order-list-shell">
          {error ? <p className="alert error">{error}</p> : null}

          {loading ? (
            <p className="muted-text">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="muted-text">No orders yet. Browse products and place your first order.</p>
          ) : (
            <div className="orders-grid enhanced-orders-grid">
              {orders.map((order) => (
                <article className="order-card produce-order-card" key={order._id}>
                  <div className="order-card-top">
                    <div>
                      <h3>{`Order #${order._id.slice(-8)}`}</h3>
                      <p className="muted-text">{formatDisplayDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={getDisplayStatus(order)} />
                  </div>

                  <div className="produce-order-items">
                    {order.items?.map((item) => (
                      <div className="produce-order-item" key={`${order._id}-${item.product?._id || item.name}`}>
                        <span>{item.emoji}</span>
                        <div>
                          <strong>{item.name}</strong>
                          <p className="muted-text">{`${item.quantity} × ₹${item.price} / ${item.unit}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <dl className="order-details">
                    <div>
                      <dt>Delivery</dt>
                      <dd>{formatDisplayDate(order.deliveryDate)}</dd>
                    </div>
                    <div>
                      <dt>Payment</dt>
                      <dd>{order.paymentMethod}</dd>
                    </div>
                    <div>
                      <dt>Payment Status</dt>
                      <dd>{order.paymentStatus}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd>₹{order.totalAmount?.toFixed?.(0) || order.totalAmount}</dd>
                    </div>
                  </dl>

                  {order.cancelReason ? (
                    <p className="muted-text">{`Reason: ${order.cancelReason}`}</p>
                  ) : null}

                  {!order.cancelledAt && order.status !== 'Delivered' ? (
                    <button className="button secondary small" type="button" onClick={() => handleCancel(order._id)}>
                      Cancel Order
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
