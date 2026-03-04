import { apiSlice } from './apiSlice';

export const pointageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPointages: builder.query({
      query: (mois) => `/pointages?mois=${mois}`,
      providesTags: ['Pointage'],
    }),
    setPointage: builder.mutation({
      query: (data) => ({ url: '/pointages', method: 'POST', body: data }),
      invalidatesTags: ['Pointage'],
    }),
    supprimerPointage: builder.mutation({
      query: (data) => ({ url: '/pointages', method: 'DELETE', body: data }),
      invalidatesTags: ['Pointage'],
    }),
  }),
});

export const {
  useGetPointagesQuery,
  useSetPointageMutation,
  useSupprimerPointageMutation,
} = pointageApiSlice;