import axios from 'axios';
import { Platform } from 'react-native';

const localBrowserFallbackBaseUrl = 'http://localhost:5000/api';
const productionFallbackBaseUrl = 'https://produce-ordering-app.onrender.com/api';

const resolveFallbackBaseUrl = () => {
  if (Platform.OS !== 'web') {
    return productionFallbackBaseUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return localBrowserFallbackBaseUrl;
    }
  }

  return productionFallbackBaseUrl;
};

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || resolveFallbackBaseUrl(),
  timeout: 10000,
});

export const setApiToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

export const getApiErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;
