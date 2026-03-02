import { apiSlice } from './apiSlice';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    marquerToutLu: builder.mutation({
      query: () => ({
        url: '/notifications/lire-tout',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    marquerLu: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/lire`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    supprimerNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    supprimerToutNotifications: builder.mutation({
      query: () => ({
        url: '/notifications/tout',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarquerToutLuMutation,
  useMarquerLuMutation,
  useSupprimerNotificationMutation,
  useSupprimerToutNotificationsMutation,
} = notificationApiSlice;