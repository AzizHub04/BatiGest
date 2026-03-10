import { apiSlice } from './apiSlice';

export const mouvementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMouvements: builder.query({
      query: ({ materielId, chantierId } = {}) => {
        let url = '/mouvements?';
        if (materielId) url += `materielId=${materielId}&`;
        if (chantierId) url += `chantierId=${chantierId}`;
        return url;
      },
      providesTags: ['Mouvement'],
    }),
    creerMouvement: builder.mutation({
      query: (data) => ({ url: '/mouvements', method: 'POST', body: data }),
      invalidatesTags: ['Mouvement', 'Materiel'],
    }),
    supprimerMouvement: builder.mutation({
      query: (id) => ({ url: `/mouvements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Mouvement', 'Materiel'],
    }),
    modifierMouvement: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/mouvements/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Mouvement', 'Materiel'],
    }),
    getMateriauxChantier: builder.query({
      query: (chantierId) => `/mouvements/chantier/${chantierId}`,
      providesTags: ['Mouvement'],
    }),
  }),
});

export const {
  useGetMouvementsQuery,
  useCreerMouvementMutation,
  useModifierMouvementMutation,
  useSupprimerMouvementMutation,
  useGetMateriauxChantierQuery,
} = mouvementApiSlice;