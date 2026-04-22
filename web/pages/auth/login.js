import Head from 'next/head';
import { signInWithPopup } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { apiClient } from '../../lib/api';
import { applyStoredToken, useRedirectIfAuthenticated } from '../../lib/auth';
import { getRequestErrorMessage } from '../../lib/errors';
import { createGoogleProvider, getFirebaseAuth, signOutFromFirebase } from '../../lib/firebase';

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
      applyStoredToken(response.data.token);
      router.push('/');
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
      const auth = await getFirebaseAuth();

      if (!auth) {
        throw new Error('Firebase auth is only available in the browser.');
      }

      const provider = createGoogleProvider();
      const credentialResult = await signInWithPopup(auth, provider);
      const firebaseIdToken = await credentialResult.user.getIdToken();

      const response = await apiClient.post('/auth/firebase-login', {
        idToken: firebaseIdToken,
      });

      applyStoredToken(response.data.token);
      router.push('/');
    } catch (requestError) {
      await signOutFromFirebase();

      if (
        requestError?.code === 'auth/popup-closed-by-user' ||
        requestError?.code === 'auth/cancelled-popup-request'
      ) {
        setError('Google sign-in was cancelled.');
      } else if (requestError?.code === 'auth/popup-blocked') {
        setError('Popup was blocked by the browser. Please allow popups and try again.');
      } else {
        setError(
          requestError.message?.startsWith('Firebase:')
            ? requestError.message
            : getRequestErrorMessage(requestError, 'Unable to continue with Google.')
        );
      }
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Login | Foodooza</title>
      </Head>

      <div className="auth-card">
        <PageHeader
          title="Login"
          description="Sign in to browse restaurants, save your cart, and manage your orders."
        />

        {successMessage ? <p className="alert success">{successMessage}</p> : null}
        {error ? <p className="alert error">{error}</p> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
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
          <button
            className="button primary"
            type="submit"
            disabled={submitting || googleSubmitting}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          className="button google-button"
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting || googleSubmitting}
        >
          {googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <p className="helper-text">
          Need an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </Layout>
  );
}
