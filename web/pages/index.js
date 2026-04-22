import Head from 'next/head';
import FeaturedItemCard from '../components/FeaturedItemCard';
import Layout from '../components/Layout';
import ShopCard from '../components/ShopCard';
import { buildServerApiClient, getServerApiBaseUrl } from '../lib/api';

export default function HomePage({ shops, featuredItems, query, city, errorMessage }) {
  return (
    <Layout>
      <Head>
        <title>Foodooza | Order Food From Top Restaurants</title>
      </Head>

      <div className="page-stack home-shell">
        <section className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Food Delivery Platform</span>
            <h1>Fast cravings, bright menus, and a restaurant vibe that actually feels alive.</h1>
            <p>
              Discover standout kitchens, browse signature dishes, and place your next order with
              a Foodooza-style customer flow.
            </p>

            <form className="search-panel" method="get">
              <input
                className="hero-input"
                type="text"
                name="q"
                placeholder="Search restaurants, cuisines, or dishes"
                defaultValue={query}
              />
              <input
                className="hero-input"
                type="text"
                name="city"
                placeholder="City"
                defaultValue={city}
              />
              <button className="button primary" type="submit">
                Explore Now
              </button>
            </form>
          </div>

          <div className="hero-card">
            <div className="hero-stat-grid">
              <div className="hero-stat">
                <strong>{shops.length}</strong>
                <span>Restaurants live</span>
              </div>
              <div className="hero-stat">
                <strong>{featuredItems.length}</strong>
                <span>Featured dishes</span>
              </div>
              <div className="hero-stat">
                <strong>25 min</strong>
                <span>Average ETA</span>
              </div>
            </div>

            <div className="hero-highlight">
              <h3>Tonight's moodboard</h3>
              <p>Pizza heat, clean bowls, stacked burgers, and fast-moving checkout energy.</p>
            </div>
          </div>
        </section>

        {errorMessage ? <p className="alert error">{errorMessage}</p> : null}

        <section className="section-block">
          <div className="section-head">
            <div>
              <span className="eyebrow">Restaurants</span>
              <h2>{query || city ? 'Search results' : 'Featured kitchens near you'}</h2>
            </div>
            {(query || city) && !errorMessage ? (
              <p className="muted-text">Showing restaurants matching your filters.</p>
            ) : (
              <p className="muted-text">Curated storefronts with quick ETAs and strong visual menus.</p>
            )}
          </div>

          <div className="shop-grid">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-head">
            <div>
              <span className="eyebrow">Best Sellers</span>
              <h2>Featured dishes</h2>
            </div>
            <p className="muted-text">A quick way to see what a full Foodooza customer flow feels like.</p>
          </div>

          <div className="featured-grid">
            {featuredItems.map((item) => (
              <FeaturedItemCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  try {
    const client = buildServerApiClient(getServerApiBaseUrl());
    const [shopsResponse, itemsResponse] = await Promise.all([
      client.get('/shops', {
        params: {
          q: query.q || '',
          city: query.city || '',
        },
      }),
      client.get('/items/featured'),
    ]);

    return {
      props: {
        shops: shopsResponse.data,
        featuredItems: itemsResponse.data,
        query: query.q || '',
        city: query.city || '',
        errorMessage: '',
      },
    };
  } catch (_error) {
    return {
      props: {
        shops: [],
        featuredItems: [],
        query: query.q || '',
        city: query.city || '',
        errorMessage: 'Unable to load the Foodooza discovery experience right now.',
      },
    };
  }
}
