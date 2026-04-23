import axios from 'axios';

const localFallbackBaseUrl = 'http://localhost:5000/api';
const productionFallbackBaseUrl = 'https://produce-ordering-app.onrender.com/api';

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

export const getBrowserApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || resolveBrowserFallbackBaseUrl();

export const getServerApiBaseUrl = () =>
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? productionFallbackBaseUrl : localFallbackBaseUrl);

export const apiClient = axios.create({
  baseURL: getBrowserApiBaseUrl(),
  withCredentials: true,
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
