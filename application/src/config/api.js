// API Configuration
// IMPORTANT: For Android/iOS devices, you cannot use 'localhost'
// You must use your computer's IP address instead
// 
// To find your IP address:
// - Windows: Run `ipconfig` in CMD and look for "IPv4 Address"
// - Mac/Linux: Run `ifconfig` or `ip addr` and look for your network interface IP
//
// Example: If your computer's IP is 192.168.1.100, use:
// const BASE_URL = 'http://192.168.1.100:8000/api/v1';
//
// For production, use your actual domain:
// const BASE_URL = 'https://yourdomain.com/api/v1';

import { Platform } from 'react-native';

// Development - Automatically select the correct URL based on platform
const getBaseUrl = () => {
  if (!__DEV__) {
    return 'https://yourdomain.com/api/v1'; // Production URL
  }
  
  // For web, use localhost
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000/api/v1';
  }
  
  // For Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  
  // For iOS Simulator or real devices, use your IP
  return 'http://192.168.1.100:8000/api/v1';
};

const BASE_URL = getBaseUrl();

export default BASE_URL;

