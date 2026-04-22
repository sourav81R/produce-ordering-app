import Head from 'next/head';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';
import { formatDisplayDate } from '../../lib/date';

export default function MyOrdersPage() {
  const { checkingAuth } = useRequireAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await apiClient.get('/orders');
        setOrders(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    if (!checkingAuth) {
      loadOrders();
    }
  }, [checkingAuth]);

  if (checkingAuth) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>My Orders | Foodooza</title>
      </Head>

      <div className="page-stack">
        <PageHeader
          title="My Orders"
          description="Track your Foodooza orders, monitor status changes, and review delivery details."
        />

        <div className="card order-list-shell">
          {error ? <p className="alert error">{error}</p> : null}

          {loading ? (
            <p className="muted-text">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="muted-text">No orders yet. Explore restaurants and place your first order.</p>
          ) : (
            <div className="orders-grid enhanced-orders-grid">
              {orders.map((order) => (
                <article className="order-card" key={order._id}>
                  <div className="order-card-top">
                    <div>
                      <h3>{order.shop?.name}</h3>
                      <p className="muted-text">{order.shop?.city}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <dl className="order-details">
                    <div>
                      <dt>Items</dt>
                      <dd>{order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd>Rs. {order.total}</dd>
                    </div>
                    <div>
                      <dt>Payment</dt>
                      <dd>{order.paymentMethod.toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt>Ordered On</dt>
                      <dd>{formatDisplayDate(order.createdAt)}</dd>
                    </div>
                  </dl>

                  <div className="order-address">
                    <strong>{order.deliveryAddress?.label || 'Address'}</strong>
                    <span>
                      {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
