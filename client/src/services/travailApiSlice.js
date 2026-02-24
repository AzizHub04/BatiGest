import { apiSlice } from './apiSlice';

export const travailApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTravauxByChantier: builder.query({
      query: (chantierId) => `/travaux/chantier/${chantierId}`,
      providesTags: ['Travail'],
    }),
    creerTravail: builder.mutation({
      query: (data) => ({
        url: '/travaux',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Travail', 'Chantier'],
    }),
    modifierTravail: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/travaux/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Travail', 'Tache', 'Chantier'],
    }),
    supprimerTravail: builder.mutation({
      query: (id) => ({
        url: `/travaux/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Travail', 'Chantier'],
    }),
  }),
});

export const {
  useGetTravauxByChantierQuery,
  useCreerTravailMutation,
  useModifierTravailMutation,
  useSupprimerTravailMutation,
} = travailApiSlice;