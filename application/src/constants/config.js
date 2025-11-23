// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api' 
  : 'https://your-production-url.com/api';

// App Configuration
export const APP_CONFIG = {
  name: 'Bazarli',
  version: '1.0.0',
  defaultLanguage: 'ar',
  supportedLanguages: ['ar', 'en'],
};

// Colors
export const COLORS = {
  primary: '#7c3aed',
  secondary: '#a78bfa',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

