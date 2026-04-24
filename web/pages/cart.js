import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useCart } from '../context/CartContext';
import { useRequireAuth } from '../lib/auth';

export default function CartPage() {
  const { checkingAuth } = useRequireAuth();
  const { items, subtotal, deliveryFee, total, updateQty, removeItem, clearCart } = useCart();

  if (checkingAuth) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Cart | GoVigi Produce Ordering App</title>
      </Head>

      <div className="page-stack">
        <PageHeader
          title="Your Cart"
          description="Adjust quantities, review pricing, and continue to checkout when you're ready."
        />

        {items.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: 54 }}>🌿</div>
            <h3>Your cart is empty</h3>
            <p className="muted-text">Browse the catalogue to add fresh produce to your basket.</p>
            <Link className="button primary" href="/products">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="cart-layout produce-cart-layout">
            <section className="cart-items produce-cart-items">
              {items.map((item) => (
                <article className="cart-item produce-cart-item" key={item.product?._id}>
                  <div
                    className="produce-cart-emoji"
                    style={{
                      backgroundColor: `${item.product?.color || '#4CAF50'}22`,
                      borderColor: `${item.product?.color || '#4CAF50'}44`,
                    }}
                  >
                    {item.product?.emoji || '🌿'}
                  </div>

                  <div className="cart-item-body">
                    <h3>{item.product?.name}</h3>
                    <p className="muted-text">
                      ₹{item.product?.price} / {item.product?.unit}
                    </p>

                    <div className="catalog-qty-stepper">
                      <button type="button" onClick={() => updateQty(item.product?._id, item.quantity - 1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.product?._id, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>

                  <div className="produce-cart-side">
                    <strong>₹{((item.product?.price || 0) * item.quantity).toFixed(0)}</strong>
                    <button className="text-link" type="button" onClick={() => removeItem(item.product?._id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="summary-card">
              <h2>Summary</h2>
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

              <div className="checkout-actions">
                <Link className="button primary" href="/checkout">
                  Proceed to Checkout →
                </Link>
                <button className="button ghost" type="button" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
