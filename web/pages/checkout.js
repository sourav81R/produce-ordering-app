import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
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

const paymentOptions = [
  {
    key: 'cod',
    title: 'Cash on delivery',
    fee: 'No upfront fee',
    description: 'Pay once the produce reaches your store location.',
  },
  {
    key: 'razorpay',
    title: 'Razorpay',
    fee: 'Online payment',
    description: 'Use secure online checkout for faster confirmation.',
  },
  {
    key: 'wallet',
    title: 'Wallet',
    fee: 'Store credit',
    description: 'Use your available balance before any other method.',
  },
];

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
  const storedUser = getStoredUser();

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

  useEffect(() => {
    if (paymentMethod === 'wallet' && wallet.balance < total) {
      setPaymentMethod('cod');
    }

    if (paymentMethod === 'razorpay' && !paymentConfig.enabled) {
      setPaymentMethod('cod');
    }
  }, [paymentConfig.enabled, paymentMethod, total, wallet.balance]);

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
        user: storedUser,
        onSuccess: async (verificationPayload) => {
          await apiClient.post('/orders/verify-payment', verificationPayload);
          await clearCart();
          await fetchWallet();
          setProcessingPayment(false);
          router.push('/orders');
        },
        onDismiss: () => {
          setProcessingPayment(false);
          setError('Payment cancelled. Your cart remains available and the order is still pending.');
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
        <title>Checkout | AgriOrder B2B</title>
      </Head>

      <PaymentModal
        open={processingPayment}
        title="Opening secure checkout"
        message="Complete the payment in the Razorpay window to confirm this order."
      />

      <div className="transaction-shell">
        <div className="transaction-header">
          <div>
            <p className="auth-section-kicker">Secure encrypted checkout</p>
            <h1>Confirm delivery and payment</h1>
            <p>
              Review your produce line items, set a delivery date, and confirm the payment method
              that best fits this order.
            </p>
          </div>

          <button className="button secondary small" type="button" onClick={() => router.push('/products')}>
            Back to catalog
          </button>
        </div>

        {error ? <p className="alert error">{error}</p> : null}

        {!items.length ? (
          <div className="card empty-state">
            <div style={{ fontSize: 54 }}>Cart</div>
            <h3>Your order draft is empty</h3>
            <p className="muted-text">Add products from the catalog before moving through checkout.</p>
          </div>
        ) : (
          <div className="transaction-grid">
            <div className="transaction-main">
              <section className="transaction-card">
                <div className="transaction-card-head">
                  <span className="transaction-step">1</span>
                  <div>
                    <h2>Shipping address</h2>
                    <p>Retail account details used for this order.</p>
                  </div>
                </div>

                <div className="transaction-address-grid">
                  <div>
                    <span>Business contact</span>
                    <strong>{storedUser?.name || 'Retail buyer'}</strong>
                  </div>
                  <div>
                    <span>Business email</span>
                    <strong>{storedUser?.email || 'No email available'}</strong>
                  </div>
                  <div className="transaction-address-wide">
                    <span>Delivery note</span>
                    <strong>Final dispatch details are confirmed when the order is processed.</strong>
                  </div>
                </div>
              </section>

              <section className="transaction-card">
                <div className="transaction-card-head">
                  <span className="transaction-step">2</span>
                  <div>
                    <h2>Delivery scheduling</h2>
                    <p>Choose the preferred dispatch date for this order.</p>
                  </div>
                </div>

                <div className="transaction-date-panel">
                  <label className="field" htmlFor="deliveryDate">
                    <span className="field-label">Delivery date</span>
                    <input
                      id="deliveryDate"
                      className="field-input"
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      max={maxDeliveryString()}
                      value={deliveryDate}
                      onChange={(event) => setDeliveryDate(event.target.value)}
                    />
                  </label>

                  <div className="transaction-date-note">
                    <strong>Selected window</strong>
                    <span>{formatDisplayDate(deliveryDate)}</span>
                    <p>Cold-chain handling and fulfillment timing are coordinated after confirmation.</p>
                  </div>
                </div>
              </section>

              <section className="transaction-card">
                <div className="transaction-card-head">
                  <span className="transaction-step">3</span>
                  <div>
                    <h2>Payment method</h2>
                    <p>Select how you want to settle this purchase order.</p>
                  </div>
                </div>

                <div className="transaction-payment-grid">
                  {paymentOptions.map((option) => {
                    const disabled =
                      (option.key === 'wallet' && wallet.balance < total) ||
                      (option.key === 'razorpay' && !paymentConfig.enabled);

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={`transaction-payment-card ${
                          paymentMethod === option.key ? 'is-active' : ''
                        }`}
                        disabled={disabled}
                        onClick={() => setPaymentMethod(option.key)}
                      >
                        <span className="transaction-payment-title">{option.title}</span>
                        <span className="transaction-payment-fee">
                          {option.key === 'wallet' ? `Balance Rs ${wallet.balance.toFixed(0)}` : option.fee}
                        </span>
                        <p>{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="transaction-summary">
              <div className="transaction-summary-card">
                <div className="transaction-summary-head">
                  <h2>Order summary</h2>
                  <p>{`${items.length} line item${items.length === 1 ? '' : 's'}`}</p>
                </div>

                <div className="transaction-summary-items">
                  {items.map((item) => (
                    <article className="transaction-summary-item" key={item.product?._id}>
                      <div>
                        <strong>{item.product?.name}</strong>
                        <span>{`${item.quantity} x Rs ${item.product?.price} / ${item.product?.unit}`}</span>
                      </div>
                      <b>{`Rs ${((item.product?.price || 0) * item.quantity).toFixed(0)}`}</b>
                    </article>
                  ))}
                </div>

                <div className="transaction-summary-breakdown">
                  <div>
                    <span>Subtotal</span>
                    <strong>{`Rs ${subtotal.toFixed(0)}`}</strong>
                  </div>
                  <div>
                    <span>Logistics</span>
                    <strong>{deliveryFee === 0 ? 'Free' : `Rs ${deliveryFee.toFixed(0)}`}</strong>
                  </div>
                  <div className="transaction-summary-total">
                    <span>Total amount</span>
                    <strong>{`Rs ${total.toFixed(0)}`}</strong>
                  </div>
                </div>

                <button
                  className="button primary full-width"
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Confirm and pay'}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
