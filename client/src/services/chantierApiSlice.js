import { apiSlice } from './apiSlice';

export const chantierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChantiers: builder.query({
      query: () => '/chantiers',
      providesTags: ['Chantier'],
    }),
    getChantier: builder.query({
      query: (id) => `/chantiers/${id}`,
      providesTags: ['Chantier'],
    }),
    creerChantier: builder.mutation({
      query: (data) => ({
        url: '/chantiers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chantier'],
    }),
    modifierChantier: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/chantiers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Chantier'],
    }),
    supprimerChantier: builder.mutation({
      query: (id) => ({
        url: `/chantiers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chantier'],
    }),
    changerEtat: builder.mutation({
      query: ({ id, etat }) => ({
        url: `/chantiers/${id}/etat`,
        method: 'PUT',
        body: { etat },
      }),
      invalidatesTags: ['Chantier'],
    }),
  }),
});

export const {
  useGetChantiersQuery,
  useGetChantierQuery,
  useCreerChantierMutation,
  useModifierChantierMutation,
  useSupprimerChantierMutation,
  useChangerEtatMutation,
} = chantierApiSlice;