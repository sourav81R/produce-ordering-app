import Head from 'next/head';
import { useMemo, useState } from 'react';
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

const sortProducts = (products, sortBy) => {
  if (sortBy === 'price-asc') {
    return [...products].sort((first, second) => first.price - second.price);
  }

  if (sortBy === 'price-desc') {
    return [...products].sort((first, second) => second.price - first.price);
  }

  if (sortBy === 'fast') {
    return [...products].sort((first, second) =>
      (first.deliveryWindow || '').localeCompare(second.deliveryWindow || '')
    );
  }

  if (sortBy === 'stock') {
    return [...products].sort((first, second) => (second.stockLevel || 0) - (first.stockLevel || 0));
  }

  return [...products].sort((first, second) => {
    const firstScore = (first.tag ? 2 : 0) + (first.stockLevel || 0);
    const secondScore = (second.tag ? 2 : 0) + (second.stockLevel || 0);
    return secondScore - firstScore;
  });
};

export default function ProductsPage({ initialProducts }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const products = initialProducts.length ? initialProducts : DUMMY_PRODUCTS;

  const categories = useMemo(
    () => [
      { key: 'All', label: 'All' },
      { key: 'Vegetable', label: 'Vegetables' },
      { key: 'Fruit', label: 'Fruits' },
    ],
    []
  );

  const filteredProducts = useMemo(() => {
    let nextProducts = products;

    if (activeCategory !== 'All') {
      nextProducts = nextProducts.filter((product) => product.category === activeCategory);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      nextProducts = nextProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.supplier?.toLowerCase().includes(query) ||
          product.origin?.toLowerCase().includes(query)
      );
    }

    return sortProducts(nextProducts, sortBy);
  }, [activeCategory, products, search, sortBy]);

  const productStats = useMemo(() => {
    const totalProducts = products.length;
    const fastItems = products.filter((product) => /15|20|25|30/.test(product.deliveryWindow || '')).length;
    const organicItems = products.filter((product) => product.isOrganic).length;

    return { totalProducts, fastItems, organicItems };
  }, [products]);

  return (
    <Layout>
      <Head>
        <title>Fresh Products | AgriOrder Fresh</title>
      </Head>

      <div className="page-stack blink-catalog-shell">
        <section className="blink-catalog-hero">
          <div className="blink-catalog-copy">
            <span className="blink-home-chip">Delivery in minutes</span>
            <h1>Fresh fruits and vegetables with a faster, cleaner storefront feel.</h1>
            <p>
              Browse by category, search quickly, and add products from a real-image catalog that
              feels much closer to a modern quick-commerce app.
            </p>
          </div>

          <div className="blink-catalog-search-panel">
            <label className="blink-search-shell" htmlFor="product-search">
              <span>Search for products</span>
              <input
                id="product-search"
                type="search"
                placeholder="Search mango, cucumber, spinach..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className="blink-stat-strip">
              <div>
                <strong>{productStats.totalProducts}</strong>
                <span>Products</span>
              </div>
              <div>
                <strong>{productStats.fastItems}</strong>
                <span>Fast picks</span>
              </div>
              <div>
                <strong>{productStats.organicItems}</strong>
                <span>Organic</span>
              </div>
            </div>
          </div>
        </section>

        <section className="blink-filter-shell">
          <div className="blink-category-row">
            {categories.map((category) => (
              <button
                key={category.key}
                className={`blink-category-pill ${activeCategory === category.key ? 'is-active' : ''}`}
                type="button"
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <label className="blink-sort-shell" htmlFor="sort-products">
            <span>Sort by</span>
            <select
              id="sort-products"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="fast">Fast delivery</option>
              <option value="stock">Stock</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </section>

        <section className="blink-product-results">
          {filteredProducts.length === 0 ? (
            <div className="catalog-empty-state cart-empty-state">
              <div className="catalog-empty-state-mark">AG</div>
              <h3>No products found</h3>
              <p>Try another search or switch categories to explore more fresh produce.</p>
            </div>
          ) : (
            <div className="catalog-card-grid blink-card-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
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
