import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api';
import authReducer from './slices/authSlice';
import storesReducer from './slices/storesSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import dashboardReducer from './slices/dashboardSlice';
import locationReducer from './slices/locationSlice';
import notificationsReducer from './slices/notificationsSlice';
import settingsReducer from './slices/settingsSlice';
import driverReducer from './slices/driverSlice';
import storeOwnerReducer from './slices/storeOwnerSlice';

export const store = configureStore({
  reducer: {
    api: apiSlice.reducer,
    auth: authReducer,
    stores: storesReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    dashboard: dashboardReducer,
    location: locationReducer,
    notifications: notificationsReducer,
    settings: settingsReducer,
    driver: driverReducer,
    storeOwner: storeOwnerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware),
});

// Export types for TypeScript (if needed)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

