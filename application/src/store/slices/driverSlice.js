import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with driver endpoints
export const driverApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Driver Application
    getDriverApplicationForm: builder.query({
      query: () => '/driver/apply',
      providesTags: ['DriverApplication'],
    }),
    submitDriverApplication: builder.mutation({
      query: (formData) => ({
        url: '/driver/apply',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['DriverApplication', 'User'],
    }),
    getDriverApplicationStatus: builder.query({
      query: () => '/driver/application-status',
      providesTags: ['DriverApplication'],
    }),
    
    // Driver Orders
    getDriverOrders: builder.query({
      query: () => '/driver/orders',
      providesTags: ['DriverOrders'],
    }),
    getDriverOrder: builder.query({
      query: (orderId) => `/driver/orders/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'DriverOrders', id: orderId }],
    }),
    acceptOrder: builder.mutation({
      query: (orderId) => ({
        url: `/driver/orders/${orderId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['DriverOrders', 'Orders'],
    }),
    rejectOrder: builder.mutation({
      query: (orderId) => ({
        url: `/driver/orders/${orderId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['DriverOrders', 'Orders'],
    }),
    pickUpOrder: builder.mutation({
      query: (orderId) => ({
        url: `/driver/orders/${orderId}/pick-up`,
        method: 'POST',
      }),
      invalidatesTags: ['DriverOrders', 'Orders'],
    }),
    startDelivery: builder.mutation({
      query: (orderId) => ({
        url: `/driver/orders/${orderId}/start-delivery`,
        method: 'POST',
      }),
      invalidatesTags: ['DriverOrders', 'Orders'],
    }),
    completeDelivery: builder.mutation({
      query: (orderId) => ({
        url: `/driver/orders/${orderId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: ['DriverOrders', 'Orders'],
    }),
    
    // Driver Location & Stats
    updateDriverLocation: builder.mutation({
      query: ({ latitude, longitude }) => ({
        url: '/driver/location',
        method: 'POST',
        body: { latitude, longitude },
      }),
    }),
    getDriverStatistics: builder.query({
      query: () => '/driver/statistics',
      providesTags: ['DriverStats'],
    }),
  }),
});

export const {
  useGetDriverApplicationFormQuery,
  useSubmitDriverApplicationMutation,
  useGetDriverApplicationStatusQuery,
  useGetDriverOrdersQuery,
  useGetDriverOrderQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  usePickUpOrderMutation,
  useStartDeliveryMutation,
  useCompleteDeliveryMutation,
  useUpdateDriverLocationMutation,
  useGetDriverStatisticsQuery,
} = driverApiSlice;

// Driver slice for local state
const initialState = {
  isOnline: false,
  currentLocation: null,
  activeOrder: null,
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setActiveOrder: (state, action) => {
      state.activeOrder = action.payload;
    },
  },
});

export const { setOnlineStatus, setCurrentLocation, setActiveOrder } = driverSlice.actions;
export default driverSlice.reducer;

