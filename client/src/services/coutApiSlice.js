import { apiSlice } from './apiSlice';

export const coutApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCoutsByChantier: builder.query({
      query: (chantierId) => `/couts/chantier/${chantierId}`,
      providesTags: ['Cout'],
    }),
    creerCout: builder.mutation({
      query: (data) => ({
        url: '/couts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cout', 'Chantier'],
    }),
    modifierCout: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/couts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cout', 'Chantier'],
    }),
    supprimerCout: builder.mutation({
      query: (id) => ({
        url: `/couts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cout', 'Chantier'],
    }),
  }),
});

export const {
  useGetCoutsByChantierQuery,
  useCreerCoutMutation,
  useModifierCoutMutation,
  useSupprimerCoutMutation,
} = coutApiSlice;