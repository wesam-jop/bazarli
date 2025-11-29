import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with stores endpoints
export const storesApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStores: builder.query({
      query: (params = {}) => ({
        url: '/stores',
        params,
      }),
      providesTags: ['Stores'],
    }),
    getStore: builder.query({
      query: (id) => `/stores/${id}`,
      providesTags: (result, error, id) => [{ type: 'Stores', id }],
    }),
    getStoreProducts: builder.query({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/products`,
        params,
      }),
      providesTags: (result, error, { storeId }) => [
        { type: 'Stores', id: storeId },
        'Products',
      ],
    }),
  }),
});

export const { useGetStoresQuery, useGetStoreQuery, useGetStoreProductsQuery } = storesApiSlice;

// Stores slice for local state
const initialState = {
  filters: {
    search: '',
    category_id: null,
    governorate_id: null,
    city_id: null,
    store_type: null,
  },
  selectedStore: null,
};

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
  },
});

export const { setFilters, clearFilters, setSelectedStore } = storesSlice.actions;
export default storesSlice.reducer;

