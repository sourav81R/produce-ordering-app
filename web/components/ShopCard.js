import Link from 'next/link';

export default function ShopCard({ shop }) {
  return (
    <article className="shop-card">
      <div
        className="shop-cover"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.62)), url(${shop.coverImage})`,
        }}
      >
        <span className={`availability-pill ${shop.isOpen ? 'open' : 'closed'}`}>
          {shop.isOpen ? 'Open now' : 'Closed'}
        </span>
      </div>

      <div className="shop-card-body">
        <div className="shop-card-top">
          <div>
            <h3>{shop.name}</h3>
            <p className="muted-text">{shop.city}</p>
          </div>
          <span className="rating-pill">{shop.rating.toFixed(1)}</span>
        </div>

        <p className="shop-description">{shop.description}</p>

        <div className="shop-meta">
          <span>{shop.cuisineTags.join(' | ')}</span>
          <span>{shop.etaMinutes} min</span>
          <span>Rs. {shop.deliveryFee} delivery</span>
        </div>

        <div className="shop-actions">
          <span className="stat-pill">Min Rs. {shop.minOrder}</span>
          <Link className="button primary small" href={`/shops/${shop.slug}`}>
            View Menu
          </Link>
        </div>
      </div>
    </article>
  );
}
