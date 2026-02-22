import { apiSlice } from './apiSlice';

export const responsableApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getResponsables: builder.query({
      query: () => '/responsables',
      providesTags: ['Responsable'],
    }),
    creerResponsable: builder.mutation({
      query: (data) => ({
        url: '/responsables',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Responsable'],
    }),
    modifierResponsable: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/responsables/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Responsable'],
    }),
    supprimerResponsable: builder.mutation({
      query: (id) => ({
        url: `/responsables/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Responsable'],
    }),
  }),
});

export const {
  useGetResponsablesQuery,
  useCreerResponsableMutation,
  useModifierResponsableMutation,
  useSupprimerResponsableMutation,
} = responsableApiSlice;