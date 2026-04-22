import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clearStoredToken, getStoredToken } from '../lib/auth';
import { setApiToken } from '../lib/api';
import { signOutFromFirebase } from '../lib/firebase';

const publicLinks = [{ href: '/products', label: 'Products' }];
const authLinks = [
  { href: '/orders/place', label: 'Place Order' },
  { href: '/orders', label: 'My Orders' },
];

export default function Layout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthenticated(Boolean(token));
    setApiToken(token);
  }, [router.pathname]);

  const handleLogout = async () => {
    clearStoredToken();
    setApiToken(null);
    setIsAuthenticated(false);
    try {
      await signOutFromFirebase();
    } catch (_error) {
      // The app JWT is already cleared; we still want to complete logout locally.
    }
    router.push('/auth/login');
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <Link className="brand" href="/products">
            Produce Ordering App
          </Link>
          <p className="brand-subtitle">Fresh produce ordering across web and mobile.</p>
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
                </Link>
              ))}
              <button className="button secondary" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" href="/auth/login">
                Login
              </Link>
              <Link className="button primary small" href="/auth/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">{children}</main>
    </div>
  );
}
