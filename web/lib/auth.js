import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setApiToken } from './api';

const TOKEN_KEY = 'produce-ordering-token';

export const getStoredToken = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
};

export const applyStoredToken = (token) => {
  setStoredToken(token);
  setApiToken(token);
};

export const clearStoredToken = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

export const useRequireAuth = () => {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setApiToken(token);
    setCheckingAuth(false);
  }, [router]);

  return { checkingAuth };
};

export const useRedirectIfAuthenticated = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setApiToken(token);
      router.replace('/products');
    }
  }, [router]);
};
