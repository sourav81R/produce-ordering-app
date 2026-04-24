import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getStoredToken } from '../lib/auth';

const TAG_CONFIG = {
  bestseller: {
    className: 'bestseller',
    label: '\u2B50 Bestseller',
  },
  organic: {
    className: 'organic',
    label: '\uD83C\uDF31 Organic',
  },
  seasonal: {
    className: 'seasonal',
    label: '\uD83C\uDF42 Seasonal',
  },
  new: {
    className: 'new',
    label: '\u2728 New',
  },
  premium: {
    className: 'premium',
    label: '\uD83D\uDC8E Premium',
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
      setFeedback('Unable to update favorite');
    }
  };

  const handleAdd = async () => {
    if (!ensureAuth()) {
      return;
    }

    try {
      await addItem(product._id, 1);
      setFeedback('Added!');
    } catch (_error) {
      setFeedback('Unable to add');
    }
  };

  return (
    <article className="catalog-product-card">
      <button className="catalog-favorite-btn" type="button" onClick={handleFavorite} aria-label="Toggle favorite">
        {isFavorite ? '❤️' : '🤍'}
      </button>
      {tag ? <span className={`tag-chip ${tag.className}`}>{tag.label}</span> : null}

      <div
        className="catalog-emoji-circle"
        style={{
          backgroundColor: `${product.color}22`,
          borderColor: `${product.color}44`,
        }}
      >
        <span>{product.emoji}</span>
      </div>

      <h3 className="catalog-product-name">{product.name}</h3>
      <p className="catalog-product-desc">{product.description}</p>

      <div className="catalog-price-row">
        <p className="catalog-price">
          {'\u20B9'}
          {product.price}
          <span className="catalog-price-unit"> / {product.unit}</span>
        </p>

        {quantity === 0 ? (
          <button className="catalog-add-btn" type="button" onClick={handleAdd}>
            {feedback === 'Added!' ? 'Added!' : '+ Add to Cart'}
          </button>
        ) : (
          <div className="catalog-qty-stepper">
            <button type="button" onClick={() => (quantity === 1 ? removeItem(product._id) : updateQty(product._id, quantity - 1))}>
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => updateQty(product._id, quantity + 1)}>
              +
            </button>
          </div>
        )}
      </div>

      <div className="catalog-card-footer-link">
        <Link href={`/order/new?product=${product._id}`}>Order directly instead</Link>
      </div>
    </article>
  );
}
