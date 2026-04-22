export default function ProductTable({ products }) {
  if (!products.length) {
    return (
      <div className="card">
        <p className="muted-text">No products available yet. Seed the backend to load the catalog.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product._id}>
          <div className="product-card-top">
            <span className={`category-badge ${product.category.toLowerCase()}`}>
              {product.category}
            </span>
            <span className="product-unit">{product.unit}</span>
          </div>
          <h3>{product.name}</h3>
          <p className="product-price">Rs. {product.price.toFixed(2)}</p>
          <p className="muted-text">
            Fresh produce ready for retailer ordering through the GoVigi catalogue.
          </p>
        </article>
      ))}
    </div>
  );
}
