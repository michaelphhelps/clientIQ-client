// API Configuration for development and production
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Fallback: In development, use the full localhost URL
  if (import.meta.env.DEV) {
    return "http://localhost:5037/api";
  }

  // Fallback: In production, use relative path that NGINX will proxy
  return "/api";
};

export const API_BASE_URL = getApiBaseUrl();
