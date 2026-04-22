import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clearStoredToken, getStoredToken } from '../lib/auth';
import { setApiToken } from '../lib/api';

const publicLinks = [{ href: '/products', label: 'Products' }];
const authLinks = [
  { href: '/order/new', label: 'Place Order' },
  { href: '/orders', label: 'Orders' },
];

export default function Navbar() {
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

    router.push('/login');
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-wrap">
          <Link className="brand" href="/products">
            Produce Ordering App
          </Link>
          <p className="brand-subtitle">Bulk produce ordering for retailers, built with a simple workflow.</p>
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
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
