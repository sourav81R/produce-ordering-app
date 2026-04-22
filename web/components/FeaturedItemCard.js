import Link from 'next/link';

export default function FeaturedItemCard({ item }) {
  return (
    <article className="featured-item-card">
      <div
        className="featured-item-image"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.5)), url(${item.imageUrl})`,
        }}
      />
      <div className="featured-item-body">
        <div className="menu-badges">
          <span className={`food-pill ${item.isVeg ? 'veg' : 'non-veg'}`}>
            {item.isVeg ? 'Veg' : 'Non-veg'}
          </span>
          <span className="stat-pill">{item.category}</span>
        </div>
        <h3>{item.name}</h3>
        <p className="muted-text">{item.description}</p>
        <div className="featured-item-meta">
          <span>Rs. {item.price}</span>
          <span>{item.shop?.name}</span>
          <span>{item.prepTimeMinutes} min</span>
        </div>
        <Link className="text-link" href={`/shops/${item.shop?.slug}`}>
          Open restaurant
        </Link>
      </div>
    </article>
  );
}
