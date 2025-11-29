// Color Variables - Matching Website Colors
// اللون الأساسي: البرتقالي #ff7a32

export const colors = {
  // Primary Color - اللون الرئيسي (برتقالي)
  primary: '#ff7a32',
  primaryLight: '#ff9d66',
  primaryDark: '#e65a1f',
  primaryHover: '#ff8f4d',
  
  // Secondary Color - اللون الثانوي (برتقالي فاتح)
  secondary: '#fff6ea',
  secondaryLight: '#ffffff',
  secondaryDark: '#ffe8d9',
  
  // Accent Color - اللون المميز (أزرق)
  accent: '#4a90e2',
  accentLight: '#6ba3f0',
  accentDark: '#357abd',
  
  // Background Color - خلفية التطبيق
  background: '#FFFFFF',
  backgroundSecondary: '#f8fafc',
  backgroundCard: '#FFFFFF',
  
  // Surface Colors
  surface: '#FFFFFF',
  surfaceSecondary: '#f1f5f9',
};

// Additional utility colors
export const additionalColors = {
  // Text colors - ألوان النصوص
  text: '#121212',
  textSecondary: '#4a4a4a',
  textLight: '#6a6a6a',
  textWhite: '#FFFFFF',
  textMuted: '#94a3b8',
  
  // Status colors - ألوان الحالات
  success: '#22c55e',
  successLight: '#4ade80',
  successDark: '#16a34a',
  
  error: '#ef4444',
  errorLight: '#f87171',
  errorDark: '#dc2626',
  
  warning: '#f97316',
  warningLight: '#fb923c',
  warningDark: '#ea580c',
  
  info: '#3b82f6',
  infoLight: '#60a5fa',
  infoDark: '#2563eb',
  
  // Gray colors - ألوان رمادية
  gray50: '#FAFAFA',
  gray100: '#F4F4F4',
  gray200: '#E0E0E0',
  gray300: '#D0D0D0',
  gray400: '#B0B0B0',
  gray500: '#909090',
  gray600: '#707070',
  gray700: '#505050',
  gray800: '#404040',
  gray900: '#121212',
  
  // Border and divider - الحدود
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#f1f5f9',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
};

// Order Status Colors - ألوان حالات الطلبات
export const statusColors = {
  pending: {
    background: '#fff7ed',
    text: '#c2410c',
    border: '#fed7aa',
  },
  confirmed: {
    background: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  },
  preparing: {
    background: '#fff5f0',
    text: '#e65a1f',
    border: '#ffcdb3',
  },
  on_delivery: {
    background: '#f0f9ff',
    text: '#0369a1',
    border: '#bae6fd',
  },
  delivered: {
    background: '#f0fdf4',
    text: '#15803d',
    border: '#bbf7d0',
  },
  cancelled: {
    background: '#fef2f2',
    text: '#dc2626',
    border: '#fecaca',
  },
};
