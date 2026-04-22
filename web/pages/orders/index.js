import Head from 'next/head';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import { formatDisplayDate } from '../../lib/date';
import { useRequireAuth } from '../../lib/auth';

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
        <title>My Orders | Produce Ordering App</title>
      </Head>

      <div className="page-stack">
        <PageHeader
          title="My Orders"
          description="Review the orders placed by the currently signed-in account."
        />

        <div className="card">
          {error ? <p className="alert error">{error}</p> : null}

          {loading ? (
            <p className="muted-text">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="muted-text">No orders yet. Place your first produce order.</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <article className="order-card" key={order._id}>
                  <div className="order-card-top">
                    <div>
                      <h3>{order.product?.name}</h3>
                      <p className="muted-text">
                        {order.product?.category} | ${order.product?.price}/{order.product?.unit}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <dl className="order-details">
                    <div>
                      <dt>Quantity</dt>
                      <dd>{order.quantity}</dd>
                    </div>
                    <div>
                      <dt>Delivery Date</dt>
                      <dd>{formatDisplayDate(order.deliveryDate)}</dd>
                    </div>
                    <div>
                      <dt>Ordered On</dt>
                      <dd>{formatDisplayDate(order.createdAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
