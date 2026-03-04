import { apiSlice } from './apiSlice';

export const ouvrierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOuvriers: builder.query({
      query: () => '/ouvriers',
      providesTags: ['Ouvrier'],
    }),
    creerOuvrier: builder.mutation({
      query: (data) => ({ url: '/ouvriers', method: 'POST', body: data }),
      invalidatesTags: ['Ouvrier'],
    }),
    modifierOuvrier: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/ouvriers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Ouvrier'],
    }),
    supprimerOuvrier: builder.mutation({
      query: (id) => ({ url: `/ouvriers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Ouvrier'],
    }),
  }),
});

export const {
  useGetOuvriersQuery,
  useCreerOuvrierMutation,
  useModifierOuvrierMutation,
  useSupprimerOuvrierMutation,
} = ouvrierApiSlice;