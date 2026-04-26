import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
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
        <title>Saved Products | AgriOrder B2B</title>
      </Head>

      <div className="page-stack">
        <section className="procurement-page-head">
          <div>
            <p className="auth-section-kicker">Saved sourcing list</p>
            <h1>Keep repeat-buy products within easy reach.</h1>
            <p>
              Save high-rotation produce, premium lines, and seasonal picks so your buying team can
              reorder faster.
            </p>
          </div>

          <div className="procurement-head-actions">
            <Link className="button secondary small" href="/products">
              Back to catalog
            </Link>
          </div>
        </section>

        {favorites.length === 0 ? (
          <div className="catalog-empty-state cart-empty-state">
            <div className="catalog-empty-state-mark">AG</div>
            <h3>No saved products yet</h3>
            <p>Use the Save action on catalog cards to build a quick shortlist for repeat orders.</p>
            <Link className="button primary" href="/products">
              Explore products
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
