import axios from 'axios';

const TOKEN_KEY = 'produce-ordering-token';
const localFallbackBaseUrl = 'http://localhost:5000/api';
const productionFallbackBaseUrl = 'https://produce-ordering-app.onrender.com/api';

const normalizeApiBaseUrl = (url) => {
  if (!url) {
    return url;
  }

  const trimmedUrl = url.replace(/\/+$/, '');

  if (trimmedUrl.endsWith('/api')) {
    return trimmedUrl;
  }

  return `${trimmedUrl}/api`;
};

const isLocalApiBaseUrl = (url) => {
  if (!url) {
    return false;
  }

  return /\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);
};

const resolveBrowserFallbackBaseUrl = () => {
  if (typeof window === 'undefined') {
    return localFallbackBaseUrl;
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return localFallbackBaseUrl;
  }

  return productionFallbackBaseUrl;
};

export const getBrowserApiBaseUrl = () => {
  const explicitUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalBrowser = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalBrowser) {
      return isLocalApiBaseUrl(explicitUrl) ? explicitUrl : localFallbackBaseUrl;
    }
  }

  return explicitUrl || resolveBrowserFallbackBaseUrl();
};

export const getServerApiBaseUrl = () => {
  const serverUrl = normalizeApiBaseUrl(process.env.API_BASE_URL);
  const browserUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (process.env.NODE_ENV !== 'production') {
    if (isLocalApiBaseUrl(serverUrl)) {
      return serverUrl;
    }

    if (isLocalApiBaseUrl(browserUrl)) {
      return browserUrl;
    }

    return localFallbackBaseUrl;
  }

  return serverUrl || browserUrl || productionFallbackBaseUrl;
};

export const apiClient = axios.create({
  baseURL: getBrowserApiBaseUrl(),
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const buildServerApiClient = (baseURL) =>
  axios.create({
    baseURL,
    withCredentials: true,
  });

export const setApiToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};
