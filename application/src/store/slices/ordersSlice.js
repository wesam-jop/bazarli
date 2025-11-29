import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with orders endpoints
export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserOrders: builder.query({
      query: (params = {}) => ({
        url: '/orders/my-orders',
        params,
      }),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Orders', 'Cart'],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders'],
    }),
    trackOrder: builder.query({
      query: (id) => `/orders/${id}/track`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
  }),
});

export const {
  useGetUserOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useTrackOrderQuery,
} = ordersApiSlice;

// Orders slice for local state
const initialState = {
  filters: {
    status: null,
  },
  selectedOrder: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
});

export const { setFilters: setOrderFilters, clearFilters: clearOrderFilters, setSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;

