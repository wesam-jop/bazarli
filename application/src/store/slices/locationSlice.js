import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with location endpoints
export const locationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGovernorates: builder.query({
      query: () => '/governorates',
      providesTags: ['Location'],
    }),
    getCities: builder.query({
      query: (governorateId) => ({
        url: '/cities',
        params: governorateId ? { governorate_id: governorateId } : {},
      }),
      providesTags: ['Location'],
    }),
    getDeliveryLocations: builder.query({
      query: () => '/delivery-locations',
      providesTags: ['DeliveryLocations'],
    }),
    addDeliveryLocation: builder.mutation({
      query: (data) => ({
        url: '/delivery-locations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DeliveryLocations'],
    }),
    updateDeliveryLocation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/delivery-locations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['DeliveryLocations'],
    }),
    deleteDeliveryLocation: builder.mutation({
      query: (id) => ({
        url: `/delivery-locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DeliveryLocations'],
    }),
    setDefaultLocation: builder.mutation({
      query: (id) => ({
        url: `/delivery-locations/${id}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['DeliveryLocations'],
    }),
  }),
});

export const {
  useGetGovernoratesQuery,
  useGetCitiesQuery,
  useGetDeliveryLocationsQuery,
  useAddDeliveryLocationMutation,
  useUpdateDeliveryLocationMutation,
  useDeleteDeliveryLocationMutation,
  useSetDefaultLocationMutation,
} = locationApiSlice;

// Location slice for local state
const initialState = {
  selectedGovernorate: null,
  selectedCity: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedGovernorate: (state, action) => {
      state.selectedGovernorate = action.payload;
      state.selectedCity = null; // Reset city when governorate changes
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
    clearSelection: (state) => {
      state.selectedGovernorate = null;
      state.selectedCity = null;
    },
  },
});

export const { setSelectedGovernorate, setSelectedCity, clearSelection } = locationSlice.actions;
export default locationSlice.reducer;
