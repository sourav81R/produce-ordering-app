import Link from 'next/link';
import { useCart } from '../context/CartContext';
import ProductImage from './ProductImage';

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

      <aside className="cart-drawer blink-drawer">
        <div className="cart-drawer-header">
          <div>
            <p className="catalog-side-kicker">Current basket</p>
            <h2>{`${count} item${count === 1 ? '' : 's'} selected`}</h2>
            <p>Review products before checkout.</p>
          </div>
          <button className="cart-icon-button" type="button" onClick={() => setDrawer(false)}>
            x
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-emoji">AG</div>
            <h3>Your basket is empty</h3>
            <p>Add products from the catalog to begin your order.</p>
            <Link className="button primary" href="/products" onClick={() => setDrawer(false)}>
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => (
                <article className="cart-drawer-item blink-drawer-item" key={item.product?._id}>
                  <ProductImage
                    product={item.product}
                    className="blink-drawer-image"
                  />

                  <div className="cart-drawer-item-body">
                    <h3>{item.product?.name}</h3>
                    <p>{item.product?.packSize || `${item.product?.unit} pack`}</p>
                    <p>{`${item.quantity} x Rs ${item.product?.price || 0}`}</p>

                    <div className="cart-drawer-qty">
                      <button type="button" onClick={() => updateQty(item.product?._id, item.quantity - 1)}>
                        -
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
                        Remove
                      </button>
                    </div>
                  </div>

                  <strong className="cart-drawer-line-total">
                    {`Rs ${(item.quantity * (item.product?.price || 0)).toFixed(0)}`}
                  </strong>
                </article>
              ))}
            </div>

            <div className="cart-drawer-summary">
              <div>
                <span>Subtotal</span>
                <strong>{`Rs ${subtotal.toFixed(0)}`}</strong>
              </div>
            </div>

            <div className="cart-drawer-actions">
              <Link className="button primary" href="/checkout" onClick={() => setDrawer(false)}>
                Continue to checkout
              </Link>
              <Link className="button secondary" href="/cart" onClick={() => setDrawer(false)}>
                Open full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
