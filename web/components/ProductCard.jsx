import Link from 'next/link';

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
  const tag = product.tag ? TAG_CONFIG[product.tag] : null;

  return (
    <article className="catalog-product-card">
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

        <Link className="catalog-add-btn" href={`/order/new?product=${product._id}`}>
          + Add
        </Link>
      </div>
    </article>
  );
}
