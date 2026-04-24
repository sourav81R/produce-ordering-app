import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clearStoredToken, getStoredToken } from '../lib/auth';
import { setApiToken } from '../lib/api';

const publicLinks = [{ href: '/products', label: 'Browse' }];
const authLinks = [
  { href: '/order/new', label: 'Place Order' },
  { href: '/orders', label: 'My Orders' },
];

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/products">
          <span className="brand-mark" aria-hidden="true">
            🌿
          </span>
          <span>GoVigi</span>
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

          <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
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
                  </Link>
                ))}
                <button className="button secondary small nav-logout" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className={`nav-link ${router.pathname === '/login' ? 'active' : ''}`} href="/login">
                  Login
                </Link>
                <Link className="button secondary small nav-logout" href="/register">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
