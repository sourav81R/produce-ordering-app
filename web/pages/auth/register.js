import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { apiClient } from '../../lib/api';
import { applyStoredToken, useRedirectIfAuthenticated } from '../../lib/auth';
import { getRequestErrorMessage } from '../../lib/errors';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useRedirectIfAuthenticated();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedPassword = formData.password.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      setSubmitting(false);
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      setSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      setSubmitting(false);
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      });
      applyStoredToken(response.data.token);
      router.push('/products');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to create your account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Create Account | Produce Ordering App</title>
      </Head>

      <div className="auth-card">
        <PageHeader
          title="Register"
          description="Create a retailer account and start placing bulk produce orders."
        />

        {error ? (
          <div className="alert error" role="alert" aria-live="polite">
            <strong>Registration failed.</strong>
            <span>{error}</span>
          </div>
        ) : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            name="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="helper-text">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </Layout>
  );
}
