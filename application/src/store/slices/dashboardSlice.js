import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with dashboard endpoints
export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerStats: builder.query({
      query: () => '/dashboard/customer',
      providesTags: ['Dashboard'],
    }),
    getStoreStats: builder.query({
      query: () => '/dashboard/store',
      providesTags: ['Dashboard'],
    }),
    getAdminStats: builder.query({
      query: () => '/dashboard/admin',
      providesTags: ['Dashboard'],
    }),
    // Profile endpoints
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/profile',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile', 'Dashboard'],
    }),
  }),
});

export const {
  useGetCustomerStatsQuery,
  useGetStoreStatsQuery,
  useGetAdminStatsQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = dashboardApiSlice;

// Dashboard slice for local state
const initialState = {
  activeTab: 'overview',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = dashboardSlice.actions;
export default dashboardSlice.reducer;

