import axios from 'axios';

const fallbackBaseUrl = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl,
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

