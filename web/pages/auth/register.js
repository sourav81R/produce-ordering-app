import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
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
      applyStoredToken(response.data.token, response.data.user);
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
        <title>Retailer Registration | AgriOrder B2B</title>
      </Head>

      <div className="auth-boarding-shell">
        <section className="auth-boarding-visual">
          <div className="auth-visual-copy">
            <span className="auth-visual-badge">Retailer Partnership Program</span>
            <h1>Open your wholesale produce workspace.</h1>
            <p>
              Join AgriOrder B2B to source vegetables and fruits with transparent pricing,
              dependable delivery windows, and quick repeat ordering.
            </p>
          </div>

          <div className="auth-visual-metrics">
            <div>
              <strong>500+</strong>
              <span>premium retailers onboarded</span>
            </div>
            <div>
              <strong>24 hrs</strong>
              <span>average dispatch turnaround</span>
            </div>
            <div>
              <strong>Fresh</strong>
              <span>cold-chain protected inventory</span>
            </div>
          </div>
        </section>

        <section className="auth-boarding-form">
          <div className="auth-progress">
            <span className="auth-progress-step is-active">1</span>
            <span className="auth-progress-line" />
            <span className="auth-progress-step">2</span>
            <span className="auth-progress-line" />
            <span className="auth-progress-step">3</span>
          </div>

          <div className="auth-boarding-card">
            <div className="auth-boarding-header">
              <p className="auth-section-kicker">Business Identity</p>
              <h2>Create your retailer account</h2>
              <p>
                Start with the essentials. Once you are inside, you can continue to favorites,
                cart, checkout, and order tracking right away.
              </p>
            </div>

            {error ? (
              <div className="alert error" role="alert" aria-live="polite">
                {error}
              </div>
            ) : null}

            <form className="form-grid auth-boarding-grid" onSubmit={handleSubmit}>
              <InputField
                label="Full name"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
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
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <div className="auth-terms">
                <input id="terms" type="checkbox" required />
                <label htmlFor="terms">
                  I agree to the wholesale trading terms and would like to activate my retailer
                  account.
                </label>
              </div>

              <div className="auth-actions-row">
                <button className="button primary" type="submit" disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Continue application'}
                </button>
                <Link className="button secondary" href="/login">
                  Already have an account?
                </Link>
              </div>
            </form>

            <p className="helper-text">
              Already registered? <Link href="/login">Sign in here</Link>
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
