import Head from 'next/head';
import { useState } from 'react';
import Layout from '../../components/Layout';
import { buildServerApiClient, getServerApiBaseUrl } from '../../lib/api';
import { addCartItem } from '../../lib/cart';

const groupItemsByCategory = (items) =>
  items.reduce((groups, item) => {
    const category = item.category || 'Signature';
    groups[category] = groups[category] || [];
    groups[category].push(item);
    return groups;
  }, {});

export default function ShopDetailPage({ shop, items, errorMessage }) {
  const [notice, setNotice] = useState('');

  if (errorMessage) {
    return (
      <Layout>
        <div className="page-stack">
          <p className="alert error">{errorMessage}</p>
        </div>
      </Layout>
    );
  }

  const groupedItems = groupItemsByCategory(items);

  const handleAddToCart = (item) => {
    const result = addCartItem({
      shopId: shop._id,
      shopName: shop.name,
      deliveryFee: shop.deliveryFee,
      itemId: item._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
    });

    setNotice(
      result.replacedShop
        ? 'Your cart was switched to this restaurant so you can complete a single-shop checkout.'
        : `${item.name} added to cart.`
    );
  };

  return (
    <Layout>
      <Head>
        <title>{shop.name} | Foodooza</title>
      </Head>

      <div className="page-stack restaurant-shell">
        <section
          className="restaurant-hero"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(124, 45, 18, 0.14), rgba(15, 23, 42, 0.72)), url(${shop.coverImage})`,
          }}
        >
          <div className="restaurant-overlay">
            <span className="eyebrow">Restaurant</span>
            <h1>{shop.name}</h1>
            <p>{shop.description}</p>
            <div className="restaurant-meta">
              <span className="stat-pill">{shop.city}</span>
              <span className="stat-pill">{shop.cuisineTags.join(' | ')}</span>
              <span className="stat-pill">{shop.etaMinutes} min</span>
              <span className="stat-pill">Rs. {shop.deliveryFee} delivery</span>
            </div>
          </div>
        </section>

        {notice ? <p className="alert success">{notice}</p> : null}

        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <section className="section-block" key={category}>
            <div className="section-head">
              <div>
                <span className="eyebrow">Menu</span>
                <h2>{category}</h2>
              </div>
            </div>

            <div className="menu-grid">
              {categoryItems.map((item) => (
                <article className="menu-card" key={item._id}>
                  <div
                    className="menu-image"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.03), rgba(15, 23, 42, 0.5)), url(${item.imageUrl})`,
                    }}
                  />
                  <div className="menu-card-body">
                    <div className="menu-badges">
                      <span className={`food-pill ${item.isVeg ? 'veg' : 'non-veg'}`}>
                        {item.isVeg ? 'Veg' : 'Non-veg'}
                      </span>
                      <span className="stat-pill">{item.prepTimeMinutes} min</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p className="muted-text">{item.description}</p>
                    <div className="menu-card-footer">
                      <span className="menu-price">Rs. {item.price}</span>
                      <button className="button primary small" onClick={() => handleAddToCart(item)}>
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const client = buildServerApiClient(getServerApiBaseUrl());
    const response = await client.get(`/shops/${params.slug}`);

    return {
      props: {
        shop: response.data.shop,
        items: response.data.items,
        errorMessage: '',
      },
    };
  } catch (_error) {
    return {
      props: {
        shop: null,
        items: [],
        errorMessage: 'Unable to load this restaurant right now.',
      },
    };
  }
}
