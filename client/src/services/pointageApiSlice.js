import { apiSlice } from './apiSlice';

export const pointageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPointages: builder.query({
      query: (mois) => `/pointages?mois=${mois}`,
      providesTags: ['Pointage'],
    }),
    setPointage: builder.mutation({
      query: (data) => ({ url: '/pointages', method: 'POST', body: data }),
      invalidatesTags: ['Pointage', 'PaiementOuvrier'],
    }),
    supprimerPointage: builder.mutation({
      query: (data) => ({ url: '/pointages', method: 'DELETE', body: data }),
      invalidatesTags: ['Pointage', 'PaiementOuvrier'],
    }),
    getOuvriersPresent: builder.query({
      query: (chantierId) => `/pointages/chantier/${chantierId}/presents`,
      providesTags: ['Pointage'],
    }),
  }),
});

export const {
  useGetPointagesQuery,
  useSetPointageMutation,
  useSupprimerPointageMutation,
  useGetOuvriersPresentQuery,
} = pointageApiSlice;