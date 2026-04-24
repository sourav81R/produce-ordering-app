import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import PaymentModal from '../components/PaymentModal';
import { useCart } from '../context/CartContext';
import { apiClient } from '../lib/api';
import { getStoredUser, useRequireAuth } from '../lib/auth';
import { formatDisplayDate } from '../lib/date';
import { getRequestErrorMessage } from '../lib/errors';
import { openRazorpayCheckout } from '../lib/razorpay';

const tomorrowString = () => {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.toISOString().slice(0, 10);
};

const maxDeliveryString = () => {
  const max = new Date();
  max.setDate(max.getDate() + 30);
  return max.toISOString().slice(0, 10);
};

export default function CheckoutPage() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();
  const { items, subtotal, deliveryFee, total, wallet, clearCart, fetchWallet } = useCart();
  const [deliveryDate, setDeliveryDate] = useState(tomorrowString);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentConfig, setPaymentConfig] = useState({ keyId: '', enabled: false });
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPaymentConfig = async () => {
      try {
        const response = await apiClient.get('/orders/payment-config');
        setPaymentConfig({
          keyId: response.data?.keyId || '',
          enabled: Boolean(response.data?.enabled || response.data?.keyId),
        });
      } catch (_error) {
        setPaymentConfig({ keyId: '', enabled: false });
      }
    };

    if (!checkingAuth) {
      loadPaymentConfig();
      fetchWallet();
    }
  }, [checkingAuth]);

  const orderPayload = useMemo(
    () => ({
      items: items.map((item) => ({
        productId: item.product?._id,
        quantity: item.quantity,
      })),
      deliveryDate,
      paymentMethod,
    }),
    [deliveryDate, items, paymentMethod]
  );

  const handlePlaceOrder = async () => {
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (paymentMethod === 'wallet') {
        await apiClient.post('/orders', orderPayload);
        await clearCart();
        await fetchWallet();
        router.push('/orders');
        return;
      }

      if (paymentMethod === 'cod') {
        await apiClient.post('/orders', orderPayload);
        await clearCart();
        router.push('/orders');
        return;
      }

      if (!paymentConfig.enabled || !paymentConfig.keyId) {
        throw new Error('Razorpay is not configured yet.');
      }

      const response = await apiClient.post('/orders', orderPayload);
      setProcessingPayment(true);

      await openRazorpayCheckout({
        keyId: paymentConfig.keyId,
        order: response.data,
        user: getStoredUser(),
        onSuccess: async (verificationPayload) => {
          await apiClient.post('/orders/verify-payment', verificationPayload);
          await clearCart();
          await fetchWallet();
          setProcessingPayment(false);
          router.push('/orders');
        },
        onDismiss: () => {
          setProcessingPayment(false);
          setError('Payment cancelled. Your cart is still available, and the order remains pending.');
        },
      });
    } catch (requestError) {
      setProcessingPayment(false);
      setError(getRequestErrorMessage(requestError, 'Unable to place your order.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Checkout | GoVigi Produce Ordering App</title>
      </Head>

      <PaymentModal
        open={processingPayment}
        title="Opening Razorpay"
        message="Please complete your payment in the Razorpay checkout window."
      />

      <div className="page-stack">
        <PageHeader
          title="Checkout"
          description="Confirm your items, choose a delivery date, and complete payment."
        />

        {error ? <p className="alert error">{error}</p> : null}

        {!items.length ? (
          <div className="card empty-state">
            <div style={{ fontSize: 54 }}>🛒</div>
            <h3>Your cart is empty</h3>
            <p className="muted-text">Add produce to your cart before checking out.</p>
          </div>
        ) : (
          <div className="checkout-layout">
            <section className="card checkout-main">
              <h2>Order Summary</h2>
              <div className="checkout-summary-list">
                {items.map((item) => (
                  <article className="checkout-summary-item" key={item.product?._id}>
                    <div className="checkout-summary-copy">
                      <strong>{item.product?.name}</strong>
                      <span>
                        {item.quantity} × ₹{item.product?.price} / {item.product?.unit}
                      </span>
                    </div>
                    <strong>₹{((item.product?.price || 0) * item.quantity).toFixed(0)}</strong>
                  </article>
                ))}
              </div>

              <div className="field">
                <span className="field-label">Delivery Date</span>
                <input
                  className="field-input"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  max={maxDeliveryString()}
                  value={deliveryDate}
                  onChange={(event) => setDeliveryDate(event.target.value)}
                />
                <span className="muted-text">{`Selected: ${formatDisplayDate(deliveryDate)}`}</span>
              </div>

              <div className="checkout-payment-grid">
                <button
                  type="button"
                  className={`payment-option ${paymentMethod === 'cod' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <strong>💵 Cash on Delivery</strong>
                  <span>Pay when the produce arrives.</span>
                </button>

                <button
                  type="button"
                  className={`payment-option ${paymentMethod === 'razorpay' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('razorpay')}
                  disabled={!paymentConfig.enabled}
                >
                  <strong>💳 Razorpay</strong>
                  <span>{paymentConfig.enabled ? 'Pay online securely.' : 'Razorpay not configured.'}</span>
                </button>

                <button
                  type="button"
                  className={`payment-option ${paymentMethod === 'wallet' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('wallet')}
                  disabled={wallet.balance < total}
                >
                  <strong>👛 Wallet</strong>
                  <span>{`Balance: ₹${wallet.balance.toFixed(0)}`}</span>
                </button>
              </div>
            </section>

            <aside className="summary-card checkout-side">
              <h2>Price Breakdown</h2>
              <div className="summary-breakdown">
                <div>
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(0)}</strong>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(0)}`}</strong>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <strong>₹{total.toFixed(0)}</strong>
                </div>
              </div>

              <button className="button primary full-width" type="button" onClick={handlePlaceOrder} disabled={submitting}>
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
