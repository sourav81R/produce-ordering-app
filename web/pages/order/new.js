import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { apiClient } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';
import { formatDisplayDate } from '../../lib/date';
import { DUMMY_PRODUCTS } from '../../lib/dummyProducts';
import { getRequestErrorMessage } from '../../lib/errors';

export default function PlaceOrderPage() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    deliveryDate: '',
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiClient.get('/products');
        const data = Array.isArray(response.data?.products)
          ? response.data.products
          : Array.isArray(response.data)
            ? response.data
            : [];
        const nextProducts = data.length ? data : DUMMY_PRODUCTS;
        setProducts(nextProducts);

        const initialProductId =
          router.query.product ||
          router.query.productId ||
          nextProducts[0]?._id ||
          '';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        setFormData({
          productId: initialProductId,
          quantity: '1',
          deliveryDate: tomorrow.toISOString().slice(0, 10),
        });
      } catch (requestError) {
        const nextProducts = DUMMY_PRODUCTS;
        setProducts(nextProducts);

        const initialProductId =
          router.query.product ||
          router.query.productId ||
          nextProducts[0]?._id ||
          '';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        setFormData({
          productId: initialProductId,
          quantity: '1',
          deliveryDate: tomorrow.toISOString().slice(0, 10),
        });
        setError(getRequestErrorMessage(requestError, 'Showing demo produce while products load.'));
      } finally {
        setLoadingProducts(false);
      }
    };

    if (!checkingAuth) {
      loadProducts();
    }
  }, [checkingAuth, router.query.product, router.query.productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const selectedProduct = products.find((product) => product._id === formData.productId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiClient.post('/orders', {
        productId: formData.productId,
        quantity: Number(formData.quantity),
        deliveryDate: formData.deliveryDate,
      });

      setSuccessMessage('Order placed successfully. You can track it in My Orders.');
      router.push('/orders');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to place the order.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Place Order | Produce Ordering App</title>
      </Head>

      <div className="page-stack">
        <PageHeader
          title="Place Order"
          description="Select a produce item, enter a bulk quantity, and choose a delivery date."
        />

        {error ? <p className="alert error">{error}</p> : null}
        {successMessage ? <p className="alert success">{successMessage}</p> : null}

        <div className="card order-form-shell">
          {loadingProducts ? (
            <p className="muted-text">Loading products...</p>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field-label">Product</span>
                <select
                  className="field-input"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {product.category} - Rs. {product.price}/{product.unit}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Quantity</span>
                <input
                  className="field-input"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">Delivery Date</span>
                <input
                  className="field-input"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  required
                />
              </label>

              {selectedProduct ? (
                <div className="card order-preview-card">
                  <span className={`category-badge ${selectedProduct.category.toLowerCase()}`}>
                    {selectedProduct.category}
                  </span>
                  <h3>{selectedProduct.name}</h3>
                  <p className="product-price">Rs. {selectedProduct.price.toFixed(2)} / {selectedProduct.unit}</p>
                  <p className="muted-text">
                    Expected delivery date: {formatDisplayDate(formData.deliveryDate)}
                  </p>
                </div>
              ) : null}

              <button className="button primary" type="submit" disabled={submitting}>
                {submitting ? 'Placing order...' : 'Submit Order'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
