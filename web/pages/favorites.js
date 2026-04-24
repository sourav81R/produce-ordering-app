import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useRequireAuth } from '../lib/auth';

export default function FavoritesPage() {
  const { checkingAuth } = useRequireAuth();
  const { favorites } = useCart();

  if (checkingAuth) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Favorites | GoVigi Produce Ordering App</title>
      </Head>

      <div className="page-stack">
        <PageHeader
          title="Favorites"
          description="Keep your most-used fruits and vegetables handy for faster repeat orders."
        />

        {favorites.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: 54 }}>❤️</div>
            <h3>No favorites yet</h3>
            <p className="muted-text">Browse the catalogue to save products for later.</p>
            <Link className="button primary" href="/products">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="catalog-card-grid">
            {favorites.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
