import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { apiClient } from '../../lib/api';
import { applyStoredToken, useRedirectIfAuthenticated } from '../../lib/auth';
import { getRequestErrorMessage } from '../../lib/errors';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
      router.push('/products');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to sign in right now.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Login | Produce Ordering App</title>
      </Head>

      <div className="auth-card">
        <PageHeader
          title="Login"
          description="Sign in to browse produce, place orders, and track retailer deliveries."
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
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="helper-text">
          Need an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </Layout>
  );
}
