const trimTrailingSlash = (value) => value?.replace(/\/+$/, '');

const getConfiguredServerUrl = () => {
  const envUrl = trimTrailingSlash(process.env.REACT_APP_API_URL);
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  return 'https://chat-app-wq7h.onrender.com/api/';
};

export const SERVER_URL = getConfiguredServerUrl();
export const API_BASE_URL = SERVER_URL ? `${SERVER_URL}/api` : '/api';
