import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with store owner endpoints
export const storeOwnerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Store Setup
    getStoreSetupForm: builder.query({
      query: () => '/store/setup',
      providesTags: ['StoreSetup'],
    }),
    createStore: builder.mutation({
      query: (formData) => ({
        url: '/store/setup',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['StoreSetup', 'User'],
    }),
    
    // Store Details
    getStoreDetails: builder.query({
      query: () => '/store/details',
      providesTags: ['MyStore'],
    }),
    updateStoreDetails: builder.mutation({
      query: (data) => ({
        url: '/store/details',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MyStore'],
    }),
    
    // Working Hours
    getStoreWorkingHours: builder.query({
      query: () => '/store/working-hours',
      providesTags: ['StoreWorkingHours'],
    }),
    updateStoreWorkingHours: builder.mutation({
      query: (data) => ({
        url: '/store/working-hours',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StoreWorkingHours'],
    }),
    
    // Store Products
    getStoreProducts: builder.query({
      query: (params = {}) => ({
        url: '/store/products',
        params,
      }),
      providesTags: ['StoreProducts'],
    }),
    addStoreProduct: builder.mutation({
      query: (formData) => ({
        url: '/store/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['StoreProducts'],
    }),
    updateStoreProduct: builder.mutation({
      query: ({ productId, data }) => ({
        url: `/store/products/${productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StoreProducts'],
    }),
    deleteStoreProduct: builder.mutation({
      query: (productId) => ({
        url: `/store/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StoreProducts'],
    }),
    getStoreCategories: builder.query({
      query: () => '/store/categories',
      providesTags: ['Categories'],
    }),
    
    // Store Orders
    getStoreOrders: builder.query({
      query: () => '/store/orders',
      providesTags: ['StoreOrders'],
    }),
    getStoreOrder: builder.query({
      query: (orderStoreId) => `/store/orders/${orderStoreId}`,
      providesTags: (result, error, orderStoreId) => [{ type: 'StoreOrders', id: orderStoreId }],
    }),
    approveStoreOrder: builder.mutation({
      query: (orderStoreId) => ({
        url: `/store/orders/${orderStoreId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['StoreOrders'],
    }),
    rejectStoreOrder: builder.mutation({
      query: (orderStoreId) => ({
        url: `/store/orders/${orderStoreId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['StoreOrders'],
    }),
    startPreparingOrder: builder.mutation({
      query: (orderStoreId) => ({
        url: `/store/orders/${orderStoreId}/start-preparing`,
        method: 'POST',
      }),
      invalidatesTags: ['StoreOrders'],
    }),
    finishPreparingOrder: builder.mutation({
      query: (orderStoreId) => ({
        url: `/store/orders/${orderStoreId}/finish-preparing`,
        method: 'POST',
      }),
      invalidatesTags: ['StoreOrders'],
    }),
    
    // Store Statistics
    getStoreStatistics: builder.query({
      query: () => '/store/statistics',
      providesTags: ['StoreStats'],
    }),
  }),
});

export const {
  useGetStoreSetupFormQuery,
  useCreateStoreMutation,
  useGetStoreDetailsQuery,
  useUpdateStoreDetailsMutation,
  useGetStoreWorkingHoursQuery,
  useUpdateStoreWorkingHoursMutation,
  useGetStoreProductsQuery,
  useAddStoreProductMutation,
  useUpdateStoreProductMutation,
  useDeleteStoreProductMutation,
  useGetStoreCategoriesQuery,
  useGetStoreOrdersQuery,
  useGetStoreOrderQuery,
  useApproveStoreOrderMutation,
  useRejectStoreOrderMutation,
  useStartPreparingOrderMutation,
  useFinishPreparingOrderMutation,
  useGetStoreStatisticsQuery,
} = storeOwnerApiSlice;

// Store Owner slice for local state
const initialState = {
  hasStore: false,
  storeId: null,
  pendingOrdersCount: 0,
  preparingOrdersCount: 0,
};

const storeOwnerSlice = createSlice({
  name: 'storeOwner',
  initialState,
  reducers: {
    setHasStore: (state, action) => {
      state.hasStore = action.payload;
    },
    setStoreId: (state, action) => {
      state.storeId = action.payload;
    },
    setPendingOrdersCount: (state, action) => {
      state.pendingOrdersCount = action.payload;
    },
    setPreparingOrdersCount: (state, action) => {
      state.preparingOrdersCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      storeOwnerApiSlice.endpoints.getStoreDetails.matchFulfilled,
      (state, action) => {
        if (action.payload?.data) {
          state.hasStore = true;
          state.storeId = action.payload.data.id;
        }
      }
    );
    builder.addMatcher(
      storeOwnerApiSlice.endpoints.getStoreOrders.matchFulfilled,
      (state, action) => {
        const data = action.payload?.data;
        if (data) {
          state.pendingOrdersCount = data.pending_orders?.length || 0;
          state.preparingOrdersCount = data.preparing_orders?.length || 0;
        }
      }
    );
  },
});

export const { setHasStore, setStoreId, setPendingOrdersCount, setPreparingOrdersCount } = storeOwnerSlice.actions;
export default storeOwnerSlice.reducer;

