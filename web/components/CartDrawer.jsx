import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, count, subtotal, drawerOpen, setDrawer, updateQty, removeItem } = useCart();

  if (!drawerOpen) {
    return null;
  }

  return (
    <div className="cart-drawer-shell" role="dialog" aria-modal="true">
      <button
        className="cart-drawer-backdrop"
        type="button"
        aria-label="Close cart drawer"
        onClick={() => setDrawer(false)}
      />

      <aside className="cart-drawer">
        <div className="cart-drawer-header">
          <div>
            <h2>{`Your Cart (${count})`}</h2>
            <p>Review your produce before checkout.</p>
          </div>
          <button className="cart-icon-button" type="button" onClick={() => setDrawer(false)}>
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-emoji">🌿</div>
            <h3>Your cart is empty</h3>
            <p>Browse the catalogue to add fresh produce.</p>
            <Link className="button primary" href="/products" onClick={() => setDrawer(false)}>
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => (
                <article className="cart-drawer-item" key={item.product?._id}>
                  <div
                    className="cart-drawer-emoji"
                    style={{
                      backgroundColor: `${item.product?.color || '#4CAF50'}22`,
                      borderColor: `${item.product?.color || '#4CAF50'}44`,
                    }}
                  >
                    {item.product?.emoji || '🌿'}
                  </div>

                  <div className="cart-drawer-item-body">
                    <h3>{item.product?.name}</h3>
                    <p>
                      {item.quantity} {item.product?.unit} × ₹{item.product?.price}
                    </p>

                    <div className="cart-drawer-qty">
                      <button type="button" onClick={() => updateQty(item.product?._id, item.quantity - 1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.product?._id, item.quantity + 1)}>
                        +
                      </button>
                      <button
                        className="cart-drawer-remove"
                        type="button"
                        onClick={() => removeItem(item.product?._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <strong className="cart-drawer-line-total">
                    ₹{(item.quantity * (item.product?.price || 0)).toFixed(0)}
                  </strong>
                </article>
              ))}
            </div>

            <div className="cart-drawer-summary">
              <div>
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(0)}</strong>
              </div>
            </div>

            <div className="cart-drawer-actions">
              <Link className="button primary" href="/checkout" onClick={() => setDrawer(false)}>
                Proceed to Checkout →
              </Link>
              <Link className="button secondary" href="/products" onClick={() => setDrawer(false)}>
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
