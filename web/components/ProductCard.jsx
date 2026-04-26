import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getStoredToken } from '../lib/auth';
import ProductImage from './ProductImage';

const TAG_CONFIG = {
  bestseller: {
    className: 'bestseller',
    label: 'Bestseller',
  },
  organic: {
    className: 'organic',
    label: 'Organic',
  },
  seasonal: {
    className: 'seasonal',
    label: 'Seasonal',
  },
  new: {
    className: 'new',
    label: 'New',
  },
  premium: {
    className: 'premium',
    label: 'Premium',
  },
};

export default function ProductCard({ product }) {
  const router = useRouter();
  const { items, favoriteIds, addItem, updateQty, removeItem, toggleFavorite } = useCart();
  const [feedback, setFeedback] = useState('');
  const tag = product.tag ? TAG_CONFIG[product.tag] : null;
  const cartItem = items.find((item) => item.product?._id === product._id);
  const quantity = cartItem?.quantity || 0;
  const isFavorite = favoriteIds.includes(product._id);

  const compareAtPrice = useMemo(() => {
    const uplift = product.tag === 'premium' ? 1.12 : 1.18;
    return Math.ceil(product.price * uplift);
  }, [product.price, product.tag]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFeedback(''), 1500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const ensureAuth = () => {
    if (!getStoredToken()) {
      router.push('/login');
      return false;
    }

    return true;
  };

  const handleFavorite = async () => {
    if (!ensureAuth()) {
      return;
    }

    try {
      await toggleFavorite(product);
    } catch (_error) {
      setFeedback('Unable to save');
    }
  };

  const handleAdd = async () => {
    if (!ensureAuth()) {
      return;
    }

    try {
      await addItem(product._id, product.minOrderQty || 1);
      setFeedback('Added');
    } catch (_error) {
      setFeedback('Unable to add');
    }
  };

  return (
    <article className="blink-product-card">
      <div className="blink-product-media">
        {tag ? <span className={`blink-card-badge ${tag.className}`}>{tag.label}</span> : null}
        <button
          className={`blink-wishlist-btn ${isFavorite ? 'is-active' : ''}`}
          type="button"
          onClick={handleFavorite}
          aria-label="Toggle favorite"
        >
          {isFavorite ? 'Saved' : 'Save'}
        </button>
        <ProductImage
          product={product}
          className="blink-product-image"
        />
      </div>

      <div className="blink-product-copy">
        <span className="blink-delivery-pill">{product.deliveryWindow || 'Fast delivery'}</span>
        <h3>{product.name}</h3>
        <p className="blink-product-pack">{product.packSize || `1 ${product.unit}`}</p>
        <p className="blink-product-meta">
          {product.supplier || 'Fresh partner'} • {product.origin || 'Local market'}
        </p>
      </div>

      <div className="blink-product-pricing">
        <div>
          <strong>{`Rs ${product.price}`}</strong>
          <span>{`/ ${product.unit}`}</span>
        </div>
        <small>{`MRP Rs ${compareAtPrice}`}</small>
      </div>

      <div className="blink-product-footer">
        <span className="blink-stock-copy">{`${product.stockLevel || 0}+ in stock`}</span>
        {quantity === 0 ? (
          <button className="blink-add-button" type="button" onClick={handleAdd}>
            {feedback === 'Added' ? 'Added' : 'ADD'}
          </button>
        ) : (
          <div className="blink-qty-stepper">
            <button
              type="button"
              onClick={() =>
                quantity === 1 ? removeItem(product._id) : updateQty(product._id, quantity - 1)
              }
            >
              -
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => updateQty(product._id, quantity + 1)}>
              +
            </button>
          </div>
        )}
      </div>

      <Link className="blink-direct-link" href={`/order/new?product=${product._id}`}>
        View full details
      </Link>
    </article>
  );
}
