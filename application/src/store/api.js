import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

// Create base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Get language from AsyncStorage
    const language = await AsyncStorage.getItem('language') || 'ar';
    headers.set('Accept-Language', language);
    
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    return headers;
  },
});

// Base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result?.error?.status === 401) {
    // Unauthorized - Clear token
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }
  
  return result;
};

// Create API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Stores',
    'Products',
    'Cart',
    'Orders',
    'Categories',
    'Favorites',
    'DeliveryLocations',
    'Dashboard',
    'Content',
    'Location',
    'Notifications',
    'Profile',
    'Settings',
    'DriverApplication',
    'DriverOrders',
    'DriverStats',
    'StoreSetup',
    'MyStore',
    'StoreWorkingHours',
    'StoreProducts',
    'StoreOrders',
    'StoreStats',
  ],
  endpoints: (builder) => ({}),
});

