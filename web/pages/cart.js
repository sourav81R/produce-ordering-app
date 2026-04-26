import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import ProductImage from '../components/ProductImage';
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
        <title>Your Basket | AgriOrder Fresh</title>
      </Head>

      <div className="page-stack">
        <section className="procurement-page-head blink-cart-page-head">
          <div>
            <p className="auth-section-kicker">Your cart</p>
            <h1>Fresh picks ready for checkout.</h1>
            <p>Update quantities, remove items, and continue with delivery scheduling.</p>
          </div>

          <div className="procurement-head-actions">
            <Link className="button secondary small" href="/products">
              Continue shopping
            </Link>
            {items.length ? (
              <button className="button ghost small" type="button" onClick={clearCart}>
                Clear basket
              </button>
            ) : null}
          </div>
        </section>

        {items.length === 0 ? (
          <div className="catalog-empty-state cart-empty-state">
            <div className="catalog-empty-state-mark">AG</div>
            <h3>Your basket is empty</h3>
            <p>Browse the catalog to add fruits and vegetables with quick delivery slots.</p>
            <Link className="button primary" href="/products">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="procurement-cart-layout blink-cart-layout">
            <section className="procurement-cart-items">
              {items.map((item) => (
                <article className="procurement-cart-card blink-cart-card" key={item.product?._id}>
                  <ProductImage
                    product={item.product}
                    className="blink-cart-image"
                  />

                  <div className="procurement-cart-copy">
                    <div className="procurement-cart-copy-head">
                      <div>
                        <p className="procurement-cart-supplier">
                          {item.product?.supplier || 'Fresh partner'}
                        </p>
                        <h3>{item.product?.name}</h3>
                        <p className="procurement-cart-origin">
                          {item.product?.packSize || `${item.product?.unit} pack`}
                        </p>
                      </div>

                      <div className="procurement-cart-price">
                        <strong>{`Rs ${((item.product?.price || 0) * item.quantity).toFixed(0)}`}</strong>
                        <span>{`Rs ${item.product?.price || 0} / ${item.product?.unit}`}</span>
                      </div>
                    </div>

                    <div className="procurement-cart-meta">
                      <span>{item.product?.deliveryWindow || 'Fast delivery'}</span>
                      <span>{item.product?.origin || 'Fresh source'}</span>
                      <span>{`MOQ ${item.product?.minOrderQty || 1}`}</span>
                    </div>

                    <div className="procurement-cart-actions">
                      <div className="blink-qty-stepper">
                        <button type="button" onClick={() => updateQty(item.product?._id, item.quantity - 1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQty(item.product?._id, item.quantity + 1)}>
                          +
                        </button>
                      </div>

                      <button
                        className="text-link"
                        type="button"
                        onClick={() => removeItem(item.product?._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="procurement-summary-card blink-summary-card">
              <div className="procurement-summary-head">
                <div>
                  <p className="catalog-side-kicker">Price details</p>
                  <h2>Bill summary</h2>
                </div>
                <span>{`${items.length} item${items.length === 1 ? '' : 's'}`}</span>
              </div>

              <div className="procurement-summary-breakdown">
                <div>
                  <span>Item total</span>
                  <strong>{`Rs ${subtotal.toFixed(0)}`}</strong>
                </div>
                <div>
                  <span>Delivery charge</span>
                  <strong>{deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee.toFixed(0)}`}</strong>
                </div>
                <div className="summary-total">
                  <span>To pay</span>
                  <strong>{`Rs ${total.toFixed(0)}`}</strong>
                </div>
              </div>

              <div className="procurement-summary-note">
                <strong>Delivery promise</strong>
                <p>Fresh items are packed after confirmation to keep them crisp and shelf-ready.</p>
              </div>

              <div className="checkout-actions">
                <Link className="button primary" href="/checkout">
                  Proceed to checkout
                </Link>
                <Link className="button secondary" href="/favorites">
                  Review saved items
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
