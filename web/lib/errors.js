export const getRequestErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Unable to reach the backend. Please confirm the API server is running.';
  }

  if (error?.response?.status >= 500) {
    return 'The server ran into an issue. Please try again in a moment.';
  }

  return fallbackMessage;
};

