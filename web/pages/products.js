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

export default function ProductsPage({ initialProducts, errorMessage, usingFallback }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const products = initialProducts.length ? initialProducts : DUMMY_PRODUCTS;

  const counts = useMemo(
    () => ({
      All: products.length,
      Vegetable: products.filter((product) => product.category === 'Vegetable').length,
      Fruit: products.filter((product) => product.category === 'Fruit').length,
    }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeCategory !== 'All') {
      list = list.filter((product) => product.category === activeCategory);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter((product) => product.name.toLowerCase().includes(query));
    }

    if (sortBy === 'price-asc') {
      list = [...list].sort((first, second) => first.price - second.price);
    }

    if (sortBy === 'price-desc') {
      list = [...list].sort((first, second) => second.price - first.price);
    }

    if (sortBy === 'name') {
      list = [...list].sort((first, second) => first.name.localeCompare(second.name));
    }

    return list;
  }, [activeCategory, products, search, sortBy]);

  const groupedProducts = useMemo(
    () => ({
      Vegetable: filteredProducts.filter((product) => product.category === 'Vegetable'),
      Fruit: filteredProducts.filter((product) => product.category === 'Fruit'),
    }),
    [filteredProducts]
  );

  const renderProductGrid = (items) => (
    <div className="catalog-card-grid">
      {items.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>Catalogue | GoVigi Produce Ordering App</title>
      </Head>

      <div className="catalog-page">
        <section className="catalog-hero">
          <div className="catalog-hero-copy">
            <span className="catalog-eyebrow">{'\uD83C\uDF3F GoVigi Fresh Picks'}</span>
            <h1>Fresh Produce, Delivered on Your Schedule</h1>
            <p>
              Browse and order farm-fresh vegetables and fruits curated for retailers who want
              better stock, better margins, and faster fulfilment.
            </p>

            <div className="catalog-stat-row">
              <span className="catalog-stat-pill">{`\uD83E\uDD66 ${counts.All} Products`}</span>
              <span className="catalog-stat-pill">{'\uD83C\uDF31 Organic Options'}</span>
              <span className="catalog-stat-pill">{'\u26A1 Fast Delivery'}</span>
            </div>
          </div>

          <label className="catalog-search" htmlFor="catalog-search">
            <span aria-hidden="true">{'\uD83D\uDD0D'}</span>
            <input
              id="catalog-search"
              type="search"
              placeholder="Search fresh produce..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </section>

        <section className="catalog-filter-bar">
          <div className="catalog-filter-pills">
            {[
              { key: 'All', label: `All (${counts.All})` },
              { key: 'Vegetable', label: `\uD83E\uDD66 Vegetable (${counts.Vegetable})` },
              { key: 'Fruit', label: `\uD83C\uDF53 Fruit (${counts.Fruit})` },
            ].map((category) => (
              <button
                key={category.key}
                className={`catalog-filter-pill ${
                  activeCategory === category.key ? 'is-active' : ''
                }`}
                type="button"
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <label className="catalog-sort-wrap" htmlFor="catalog-sort">
            <span>Sort:</span>
            <select
              id="catalog-sort"
              className="catalog-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price {'\u2191'}</option>
              <option value="price-desc">Price {'\u2193'}</option>
              <option value="name">Name</option>
            </select>
          </label>
        </section>

        <section className="catalog-grid-shell">
          {usingFallback ? (
            <p className="catalog-fallback-note">
              {errorMessage || 'Showing demo produce while the live catalogue catches up.'}
            </p>
          ) : null}

          {!filteredProducts.length ? (
            <div className="catalog-empty-state">
              <div style={{ fontSize: 64 }}>{'\uD83C\uDF31'}</div>
              <h3>No products here yet</h3>
              <p>Check back soon — fresh produce is on its way.</p>
            </div>
          ) : activeCategory === 'All' ? (
            <>
              {['Vegetable', 'Fruit'].map((category) =>
                groupedProducts[category].length ? (
                  <section className="catalog-section" key={category}>
                    <div className="catalog-section-header">
                      <span className="catalog-section-emoji">
                        {category === 'Vegetable' ? '\uD83E\uDD66' : '\uD83C\uDF53'}
                      </span>
                      <h2>{category === 'Vegetable' ? 'Vegetables' : 'Fruits'}</h2>
                      <span className="catalog-count-pill">
                        {groupedProducts[category].length} items
                      </span>
                      <hr />
                    </div>

                    {renderProductGrid(groupedProducts[category])}
                  </section>
                ) : null
              )}
            </>
          ) : (
            renderProductGrid(filteredProducts)
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
        errorMessage: data.length ? '' : 'Showing demo produce because the live catalogue is empty.',
        usingFallback: data.length === 0,
      },
    };
  } catch (_error) {
    return {
      props: {
        initialProducts: DUMMY_PRODUCTS,
        errorMessage: 'Showing demo produce because the backend is unavailable right now.',
        usingFallback: true,
      },
    };
  }
}
