import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { buildServerApiClient, getServerApiBaseUrl } from '../lib/api';
import { DUMMY_PRODUCTS } from '../lib/dummyProducts';

const normalizeProductsResponse = (payload) => {
  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const categoryCards = [
  { label: 'Vegetables', subtitle: 'Leafy, crunchy, everyday staples', anchor: 'Vegetable' },
  { label: 'Fruits', subtitle: 'Seasonal, juicy, ready-to-eat picks', anchor: 'Fruit' },
  { label: 'Premium Picks', subtitle: 'Export-grade and specialty produce', anchor: 'premium' },
  { label: 'Quick Refill', subtitle: 'Fast-moving kitchen essentials', anchor: 'bestseller' },
];

export default function HomePage({ initialProducts }) {
  const products = initialProducts.length ? initialProducts : DUMMY_PRODUCTS;
  const spotlightProducts = products.slice(0, 8);

  return (
    <Layout>
      <Head>
        <title>AgriOrder Fresh | Fruits & Vegetables Delivered Fast</title>
      </Head>

      <div className="page-stack blink-home-shell">
        <section className="blink-home-hero">
          <div className="blink-home-copy">
            <span className="blink-home-chip">Fresh produce in minutes</span>
            <h1>Groceries, fruits, and vegetables that feel ready to order right now.</h1>
            <p>
              Fast delivery styling, cleaner product discovery, and reliable produce imagery across the
              full shopping flow.
            </p>

            <div className="blink-home-actions">
              <Link className="button primary" href="/products">
                Shop all products
              </Link>
              <Link className="button secondary" href="/favorites">
                View saved items
              </Link>
            </div>

            <div className="blink-home-metrics">
              <div>
                <strong>16+</strong>
                <span>storefront-ready fresh products</span>
              </div>
              <div>
                <strong>25-45</strong>
                <span>minute delivery windows</span>
              </div>
              <div>
                <strong>Rich</strong>
                <span>catalog-ready produce visuals</span>
              </div>
            </div>
          </div>

          <div className="blink-home-panel">
            <div className="blink-home-panel-card">
              <p>Popular right now</p>
              <strong>Mangoes, cucumbers, spinach, and strawberries</strong>
              <span>Quick-shop sections now look and feel like a modern grocery storefront.</span>
            </div>
            <div className="blink-home-panel-grid">
              {categoryCards.map((category) => (
                <Link className="blink-category-card" key={category.label} href="/products">
                  <strong>{category.label}</strong>
                  <span>{category.subtitle}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="blink-section-shell">
          <div className="blink-section-head">
            <div>
              <p>Shop by mood</p>
              <h2>Quick picks for your next basket.</h2>
            </div>
            <Link className="text-link" href="/products">
              Explore full catalog
            </Link>
          </div>

          <div className="catalog-card-grid blink-card-grid">
            {spotlightProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const client = buildServerApiClient(getServerApiBaseUrl());
    const response = await client.get('/products');
    const data = normalizeProductsResponse(response.data);

    return {
      props: {
        initialProducts: data.length ? data : DUMMY_PRODUCTS,
      },
    };
  } catch (_error) {
    return {
      props: {
        initialProducts: DUMMY_PRODUCTS,
      },
    };
  }
}
