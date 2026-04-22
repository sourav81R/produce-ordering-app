export default function ProductTable({ products }) {
  if (!products.length) {
    return (
      <div className="card">
        <p className="muted-text">No products available yet. Seed the backend to load the catalog.</p>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <table className="product-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

