import Head from 'next/head';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';
import { formatDisplayDate } from '../../lib/date';
import { getRequestErrorMessage } from '../../lib/errors';

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
        setError(getRequestErrorMessage(requestError, 'Unable to load your orders.'));
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
          description="Track the status of your produce orders from placement through delivery."
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
                <article className="order-card" key={order._id}>
                  <div className="order-card-top">
                    <div>
                      <h3>{order.productId?.name}</h3>
                      <p className="muted-text">{order.productId?.category}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <dl className="order-details">
                    <div>
                      <dt>Quantity</dt>
                      <dd>{order.quantity}</dd>
                    </div>
                    <div>
                      <dt>Unit Price</dt>
                      <dd>Rs. {order.productId?.price} / {order.productId?.unit}</dd>
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

                  <div className="order-address">
                    <strong>Estimated Cost</strong>
                    <span>Rs. {((order.productId?.price || 0) * order.quantity).toFixed(2)}</span>
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
