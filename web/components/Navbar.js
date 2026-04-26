import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { setApiToken } from '../lib/api';
import { clearStoredToken, getStoredToken } from '../lib/auth';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
];

const authLinks = [
  { href: '/favorites', label: 'Saved' },
  { href: '/orders', label: 'Orders' },
];

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, favorites, setDrawer } = useCart();

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthenticated(Boolean(token));
    setApiToken(token);
    setMenuOpen(false);
  }, [router.pathname]);

  const handleLogout = async () => {
    clearStoredToken();
    setApiToken(null);
    router.push('/login');
  };

  return (
    <header className="site-header blink-shell-header">
      <div className="blink-top-strip">
        <span>Fresh produce marketplace</span>
        <p>Real product photos, faster browsing, and cleaner quick-commerce styling.</p>
      </div>

      <div className="site-header-inner blink-header-inner">
        <Link className="brand blink-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            AG
          </span>
          <span className="brand-copy">
            <strong>AgriOrder Fresh</strong>
            <small>fruits, vegetables, and essentials</small>
          </span>
        </Link>

        <div className="site-header-actions">
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`site-nav blink-nav ${menuOpen ? 'is-open' : ''}`}>
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                className={`nav-link ${router.pathname === link.href ? 'active' : ''}`}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.href}
                    className={`nav-link ${router.pathname === link.href ? 'active' : ''}`}
                    href={link.href}
                  >
                    {link.label}
                    {link.href === '/favorites' ? (
                      <span className="nav-badge">{favorites.length}</span>
                    ) : null}
                  </Link>
                ))}

                <Link
                  className={`nav-link ${router.pathname === '/cart' ? 'active' : ''}`}
                  href="/cart"
                >
                  Cart
                </Link>

                <button className="nav-cart-button blink-cart-button" type="button" onClick={() => setDrawer(true)}>
                  <span>Basket</span>
                  {count > 0 ? <span className="nav-cart-count">{count}</span> : null}
                </button>

                <button
                  className="button secondary small nav-logout blink-logout"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className={`nav-link ${router.pathname === '/login' ? 'active' : ''}`}
                  href="/login"
                >
                  Sign in
                </Link>
                <Link className="button secondary small blink-signup" href="/register">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
