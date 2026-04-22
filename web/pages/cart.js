import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import { apiClient } from '../lib/api';
import {
  clearCart,
  getCartItems,
  getCartSummary,
  removeCartItem,
  updateCartItemQuantity,
} from '../lib/cart';
import { getStoredToken, useRequireAuth } from '../lib/auth';

export default function CartPage() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    label: 'Home',
    line1: '',
    city: 'Kolkata',
    notes: '',
    paymentMethod: 'cod',
    scheduledFor: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!checkingAuth) {
      setCartItems(getCartItems());
    }
  }, [checkingAuth]);

  const summary = getCartSummary(cartItems);
  const shopName = cartItems[0]?.shopName || '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleQuantityChange = (itemId, quantity) => {
    setCartItems(updateCartItemQuantity(itemId, quantity));
  };

  const handleRemove = (itemId) => {
    setCartItems(removeCartItem(itemId));
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    if (!getStoredToken()) {
      setSubmitting(false);
      router.push('/login');
      return;
    }

    try {
      await apiClient.post('/orders', {
        shopId: cartItems[0].shopId,
        items: cartItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          label: formData.label,
          line1: formData.line1,
          city: formData.city,
          notes: formData.notes,
        },
        paymentMethod: formData.paymentMethod,
        scheduledFor: formData.scheduledFor || null,
      });

      clearCart();
      router.push('/orders');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to complete checkout right now.');
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
        <title>Cart | Foodooza</title>
      </Head>

      <div className="page-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>{shopName ? `Your cart from ${shopName}` : 'Your cart'}</h1>
          </div>
        </div>

        {error ? <p className="alert error">{error}</p> : null}

        {!cartItems.length ? (
          <div className="empty-state">
            <h2>Your cart is empty</h2>
            <p>Browse restaurants and add a few dishes to start a checkout.</p>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {cartItems.map((item) => (
                <article className="cart-item" key={item.itemId}>
                  <div
                    className="cart-item-image"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                  <div className="cart-item-body">
                    <h3>{item.name}</h3>
                    <p className="muted-text">Rs. {item.price} each</p>
                    <div className="inline-actions">
                      <label className="field inline-field">
                        <span className="field-label">Qty</span>
                        <input
                          className="field-input quantity-input"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleQuantityChange(item.itemId, Number(event.target.value))
                          }
                        />
                      </label>
                      <button
                        className="button ghost small"
                        type="button"
                        onClick={() => handleRemove(item.itemId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong>Rs. {item.price * item.quantity}</strong>
                </article>
              ))}
            </section>

            <aside className="summary-card">
              <h2>Delivery details</h2>
              <form className="form-grid" onSubmit={handleCheckout}>
                <InputField label="Address Label" name="label" value={formData.label} onChange={handleChange} />
                <InputField
                  label="Street Address"
                  name="line1"
                  value={formData.line1}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Delivery Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
                <label className="field">
                  <span className="field-label">Payment Method</span>
                  <select
                    className="field-input"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </label>
                <InputField
                  label="Schedule For"
                  name="scheduledFor"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={handleChange}
                />

                <div className="summary-breakdown">
                  <div>
                    <span>Items</span>
                    <strong>{summary.totalItems}</strong>
                  </div>
                  <div>
                    <span>Subtotal</span>
                    <strong>Rs. {summary.subtotal}</strong>
                  </div>
                  <div>
                    <span>Delivery</span>
                    <strong>Rs. {summary.deliveryFee}</strong>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <strong>Rs. {summary.total}</strong>
                  </div>
                </div>

                <button className="button primary" type="submit" disabled={submitting}>
                  {submitting ? 'Placing order...' : 'Place Order'}
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
