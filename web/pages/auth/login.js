import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import { apiClient } from '../../lib/api';
import { applyStoredToken, useRedirectIfAuthenticated } from '../../lib/auth';
import { getRequestErrorMessage } from '../../lib/errors';
import { getGoogleRedirectSignInResult, startGoogleSignIn } from '../../lib/firebase';

const getGoogleAuthErrorMessage = (requestError) => {
  if (requestError?.response?.status === 404) {
    return 'Google sign-in is not available on the deployed backend yet. Redeploy the API, then try again.';
  }

  return getRequestErrorMessage(requestError, 'Unable to continue with Google right now.');
};

const platformHighlights = [
  'Bulk produce ordering with predictable delivery dates',
  'Favorites, cart, and checkout across web and mobile',
  'Live order tracking with clean retailer status history',
];

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useRedirectIfAuthenticated();

  useEffect(() => {
    if (router.query.registered === '1') {
      setSuccessMessage('Registration complete. Please sign in.');
    }
  }, [router.query.registered]);

  useEffect(() => {
    let active = true;

    const finalizeGoogleRedirect = async () => {
      try {
        const result = await getGoogleRedirectSignInResult();

        if (!active || !result?.user) {
          return;
        }

        setGoogleSubmitting(true);
        setError('');

        const idToken = await result.user.getIdToken();
        const response = await apiClient.post('/auth/google', { idToken });
        applyStoredToken(response.data.token, response.data.user);
        router.replace('/products');
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(getGoogleAuthErrorMessage(requestError));
      } finally {
        if (active) {
          setGoogleSubmitting(false);
        }
      }
    };

    finalizeGoogleRedirect();

    return () => {
      active = false;
    };
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', formData);
      applyStoredToken(response.data.token, response.data.user);
      router.push('/products');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to sign in right now.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    setError('');

    try {
      const { redirected, credential } = await startGoogleSignIn();

      if (redirected) {
        return;
      }

      const idToken = await credential.user.getIdToken();
      const response = await apiClient.post('/auth/google', { idToken });
      applyStoredToken(response.data.token, response.data.user);
      router.push('/products');
    } catch (requestError) {
      if (requestError?.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled before completion.');
      } else {
        setError(getGoogleAuthErrorMessage(requestError));
      }
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Retailer Sign In | AgriOrder B2B</title>
      </Head>

      <div className="auth-boarding-shell">
        <section className="auth-boarding-visual auth-boarding-visual-dark">
          <div className="auth-visual-copy">
            <span className="auth-visual-badge">AgriOrder B2B</span>
            <h1>Fresh produce ordering for modern retailers.</h1>
            <p>
              Sign in to continue browsing stock, place bulk orders, and keep every delivery on
              schedule across web and mobile.
            </p>
          </div>

          <div className="auth-visual-list">
            {platformHighlights.map((item) => (
              <div key={item} className="auth-visual-list-item">
                <span aria-hidden="true">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-boarding-form">
          <div className="auth-boarding-card">
            <div className="auth-boarding-header">
              <p className="auth-section-kicker">Retailer access</p>
              <h2>Welcome back</h2>
              <p>Use your account to continue into the ordering dashboard.</p>
            </div>

            {successMessage ? <p className="alert success">{successMessage}</p> : null}
            {error ? <p className="alert error">{error}</p> : null}

            <form className="form-grid auth-boarding-grid" onSubmit={handleSubmit}>
              <InputField
                label="Business email"
                name="email"
                type="email"
                placeholder="name@business.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button className="button primary" type="submit" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="auth-divider">or continue with</div>

            <button
              className="button google-button full-width"
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleSubmitting}
            >
              <span className="google-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.8-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C17 3.2 14.8 2.2 12 2.2 6.9 2.2 2.8 6.4 2.8 11.5s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.2-1.6H12Z"
                  />
                  <path
                    fill="#34A853"
                    d="M2.8 11.5c0 1.7.6 3.3 1.7 4.6l3-2.3c-.4-.7-.7-1.5-.7-2.3s.2-1.6.7-2.3l-3-2.3c-1.1 1.3-1.7 2.9-1.7 4.6Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 20.8c2.5 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.8-3.1.8-2.5 0-4.6-1.7-5.4-4l-3 2.3c1.6 3.2 4.8 5.3 8.4 5.3Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M18 18.6c1.7-1.6 2.8-4 2.8-7.1 0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.4-1.1 2.6-2.4 3.4l2.9 2.2Z"
                  />
                </svg>
              </span>
              {googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
            </button>

            <p className="helper-text">
              Need an account? <Link href="/register">Create one</Link>
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
