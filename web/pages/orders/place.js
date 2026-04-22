import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { apiClient } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';

export default function PlaceOrderPage() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: '',
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
        setProducts(response.data);
        if (response.data.length > 0) {
          setFormData((current) => ({
            ...current,
            product: current.product || response.data[0]._id,
          }));
        }
      } catch (_error) {
        setError('Unable to load products.');
      } finally {
        setLoadingProducts(false);
      }
    };

    if (!checkingAuth) {
      loadProducts();
    }
  }, [checkingAuth]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiClient.post('/orders', formData);
      setSuccessMessage('Order placed successfully.');
      setTimeout(() => {
        router.push('/orders');
      }, 700);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to place your order.');
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
          description="Select a product, set quantity, and choose the requested delivery date."
        />

        <div className="card">
          {error ? <p className="alert error">{error}</p> : null}
          {successMessage ? <p className="alert success">{successMessage}</p> : null}

          {loadingProducts ? (
            <p className="muted-text">Loading products...</p>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field-label">Product</span>
                <select
                  className="field-input"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                >
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} | {product.category} | ${product.price}/{product.unit}
                    </option>
                  ))}
                </select>
              </label>

              <InputField
                label="Quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              <InputField
                label="Delivery Date"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
              />

              <button className="button primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Place Order'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
