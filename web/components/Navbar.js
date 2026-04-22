import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clearStoredToken, getStoredToken } from '../lib/auth';
import { setApiToken } from '../lib/api';
import { getCartItems } from '../lib/cart';
import { signOutFromFirebase } from '../lib/firebase';

const publicLinks = [{ href: '/', label: 'Discover' }];
const authLinks = [
  { href: '/cart', label: 'Cart' },
  { href: '/orders', label: 'Orders' },
];

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthenticated(Boolean(token));
    setApiToken(token);
    setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));

    const handleCartUpdated = () => {
      setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));
    };

    window.addEventListener('foodooza-cart-updated', handleCartUpdated);

    return () => {
      window.removeEventListener('foodooza-cart-updated', handleCartUpdated);
    };
  }, [router.pathname]);

  const handleLogout = async () => {
    clearStoredToken();
    setApiToken(null);
    setIsAuthenticated(false);

    try {
      await signOutFromFirebase();
    } catch (_error) {
      // The local session is already cleared.
    }

    router.push('/login');
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-wrap">
          <Link className="brand" href="/">
            Foodooza
          </Link>
          <p className="brand-subtitle">Hot meals, fast delivery, and restaurant-first vibes.</p>
        </div>

        <nav className="site-nav">
          {publicLinks.map((link) => (
            <Link key={link.href} className="nav-link" href={link.href}>
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              {authLinks.map((link) => (
                <Link key={link.href} className="nav-link" href={link.href}>
                  {link.label}
                  {link.href === '/cart' && cartCount ? (
                    <span className="nav-badge">{cartCount}</span>
                  ) : null}
                </Link>
              ))}
              <button className="button secondary small" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" href="/login">
                Login
              </Link>
              <Link className="button primary small" href="/register">
                Start Ordering
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
