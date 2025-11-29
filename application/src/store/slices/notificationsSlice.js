import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api';

// Extend API slice with notifications endpoints
export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notifications'],
    }),
    getUnreadCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApiSlice;

// Notifications slice for local state
const initialState = {
  showNotifications: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications;
    },
    showNotifications: (state) => {
      state.showNotifications = true;
    },
    hideNotifications: (state) => {
      state.showNotifications = false;
    },
  },
});

export const { toggleNotifications, showNotifications, hideNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;

