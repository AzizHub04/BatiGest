// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL ,
};

// Export individual constants for convenience
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const SOCKET_URL = API_CONFIG.SOCKET_URL;
