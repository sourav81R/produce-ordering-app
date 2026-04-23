import axios from 'axios';

const developmentFallbackBaseUrl = 'http://localhost:5000/api';
const productionFallbackBaseUrl = 'https://produce-ordering-app.onrender.com/api';

const resolveFallbackBaseUrl = () =>
  process.env.NODE_ENV === 'production'
    ? productionFallbackBaseUrl
    : developmentFallbackBaseUrl;

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
