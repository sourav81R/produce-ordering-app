import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setApiToken } from './api';

const TOKEN_KEY = 'produce-ordering-token';
const USER_KEY = 'produce-ordering-user';

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('govigi-auth-changed'));
  }
};

export const getStoredToken = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null');
  } catch (_error) {
    return null;
  }
};

export const setStoredToken = (token) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
    notifyAuthChange();
  }
};

export const setStoredUser = (user) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user || null));
  }
};

export const applyStoredToken = (token, user = null) => {
  setStoredToken(token);
  setStoredUser(user);
  setApiToken(token);
};

export const clearStoredToken = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    notifyAuthChange();
  }
};

export const useRequireAuth = () => {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace('/login');
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
