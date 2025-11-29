import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Inject settings endpoints into the API slice
export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get app settings
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
      transformResponse: (response) => response.data,
    }),
  }),
});

// Export hooks
export const { useGetSettingsQuery } = settingsApiSlice;

// Settings slice for local state
const initialState = {
  appName: 'DeliGo',
  appDescription: '',
  appLogo: '',
  appVersion: '1.0.0',
  defaultLanguage: 'ar',
  defaultCurrency: 'SYP',
  currencySymbol: 'ل.س',
  minOrderAmount: 0,
  defaultDeliveryFee: 0,
  defaultEstimatedDeliveryTime: 15,
  maintenanceMode: false,
  maintenanceMessage: '',
  paymentMethods: [],
  supportPhone: '',
  supportEmail: '',
  isLoaded: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      const data = action.payload;
      state.appName = data.app_name || 'DeliGo';
      state.appDescription = data.app_description || '';
      state.appLogo = data.app_logo || '';
      state.appVersion = data.app_version || '1.0.0';
      state.defaultLanguage = data.default_language || 'ar';
      state.defaultCurrency = data.default_currency || 'SYP';
      state.currencySymbol = data.currency_symbol || 'ل.س';
      state.minOrderAmount = data.min_order_amount || 0;
      state.defaultDeliveryFee = data.default_delivery_fee || 0;
      state.defaultEstimatedDeliveryTime = data.default_estimated_delivery_time || 15;
      state.maintenanceMode = data.maintenance_mode || false;
      state.maintenanceMessage = data.maintenance_message || '';
      state.paymentMethods = data.payment_methods || [];
      state.supportPhone = data.support_phone || '';
      state.supportEmail = data.support_email || '';
      state.isLoaded = true;
    },
    clearSettings: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      settingsApiSlice.endpoints.getSettings.matchFulfilled,
      (state, action) => {
        const data = action.payload;
        state.appName = data.app_name || 'DeliGo';
        state.appDescription = data.app_description || '';
        state.appLogo = data.app_logo || '';
        state.appVersion = data.app_version || '1.0.0';
        state.defaultLanguage = data.default_language || 'ar';
        state.defaultCurrency = data.default_currency || 'SYP';
        state.currencySymbol = data.currency_symbol || 'ل.س';
        state.minOrderAmount = data.min_order_amount || 0;
        state.defaultDeliveryFee = data.default_delivery_fee || 0;
        state.defaultEstimatedDeliveryTime = data.default_estimated_delivery_time || 15;
        state.maintenanceMode = data.maintenance_mode || false;
        state.maintenanceMessage = data.maintenance_message || '';
        state.paymentMethods = data.payment_methods || [];
        state.supportPhone = data.support_phone || '';
        state.supportEmail = data.support_email || '';
        state.isLoaded = true;
      }
    );
  },
});

export const { setSettings, clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;

