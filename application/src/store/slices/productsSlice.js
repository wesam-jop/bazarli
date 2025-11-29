import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with products endpoints
export const productsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Products'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    getCategory: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),
    // Favorites endpoints
    getFavorites: builder.query({
      query: () => '/favorites',
      providesTags: ['Favorites'],
    }),
    addToFavorites: builder.mutation({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorites'],
    }),
    removeFromFavorites: builder.mutation({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),
    getProductsByCategory: builder.query({
      query: (categoryId) => ({
        url: '/products',
        params: {
          category_id: categoryId,
          per_page: 3,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      }),
      providesTags: (result, error, categoryId) => [{ type: 'Products', id: `category-${categoryId}` }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useGetProductsByCategoryQuery,
  useGetFavoritesQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = productsApiSlice;

// Products slice for local state
const initialState = {
  filters: {
    search: '',
    category_id: null,
    store_id: null,
    governorate_id: null,
    city_id: null,
    featured: false,
  },
  sortBy: 'sort_order',
  sortOrder: 'asc',
  selectedProduct: null,
  selectedCategoryId: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setSelectedCategoryId: (state, action) => {
      state.selectedCategoryId = action.payload;
    },
  },
});

export const { setFilters: setProductFilters, clearFilters: clearProductFilters, setSort, setSelectedProduct, setSelectedCategoryId } = productsSlice.actions;
export default productsSlice.reducer;

