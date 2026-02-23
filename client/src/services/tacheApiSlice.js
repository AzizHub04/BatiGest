import { apiSlice } from './apiSlice';

export const tacheApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTachesByTravail: builder.query({
      query: (travailId) => `/taches/travail/${travailId}`,
      providesTags: ['Tache'],
    }),
    creerTache: builder.mutation({
      query: (data) => ({
        url: '/taches',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tache', 'Travail', 'Chantier'],
    }),
    modifierTache: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/taches/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Tache', 'Travail', 'Chantier'],
    }),
    changerStatut: builder.mutation({
      query: ({ id, statut }) => ({
        url: `/taches/${id}/statut`,
        method: 'PUT',
        body: { statut },
      }),
      invalidatesTags: ['Tache', 'Travail', 'Chantier'],
    }),
    supprimerTache: builder.mutation({
      query: (id) => ({
        url: `/taches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tache', 'Travail', 'Chantier'],
    }),
  }),
});

export const {
  useGetTachesByTravailQuery,
  useCreerTacheMutation,
  useModifierTacheMutation,
  useChangerStatutMutation,
  useSupprimerTacheMutation,
} = tacheApiSlice;