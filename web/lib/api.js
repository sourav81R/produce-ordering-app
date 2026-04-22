import axios from 'axios';

const fallbackBaseUrl = 'http://localhost:5000/api';

export const getBrowserApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || fallbackBaseUrl;

export const getServerApiBaseUrl = () =>
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || fallbackBaseUrl;

export const apiClient = axios.create({
  baseURL: getBrowserApiBaseUrl(),
});

export const buildServerApiClient = (baseURL) =>
  axios.create({
    baseURL,
  });

export const setApiToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

