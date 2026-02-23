import { apiSlice } from './apiSlice';

export const noteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotesByChantier: builder.query({
      query: (chantierId) => `/notes/chantier/${chantierId}`,
      providesTags: ['Note'],
    }),
    creerNote: builder.mutation({
      query: (data) => ({
        url: '/notes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Note'],
    }),
    modifierNote: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/notes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Note'],
    }),
    supprimerNote: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Note'],
    }),
  }),
});

export const {
  useGetNotesByChantierQuery,
  useCreerNoteMutation,
  useModifierNoteMutation,
  useSupprimerNoteMutation,
} = noteApiSlice;