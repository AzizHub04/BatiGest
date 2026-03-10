import { apiSlice } from './apiSlice';

export const materielApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMateriels: builder.query({
      query: () => '/materiels',
      providesTags: ['Materiel'],
    }),
    creerMateriel: builder.mutation({
      query: (data) => ({ url: '/materiels', method: 'POST', body: data }),
      invalidatesTags: ['Materiel'],
    }),
    modifierMateriel: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/materiels/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Materiel'],
    }),
    supprimerMateriel: builder.mutation({
      query: (id) => ({ url: `/materiels/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Materiel'],
    }),
  }),
});

export const {
  useGetMaterielsQuery,
  useCreerMaterielMutation,
  useModifierMaterielMutation,
  useSupprimerMaterielMutation,
} = materielApiSlice;