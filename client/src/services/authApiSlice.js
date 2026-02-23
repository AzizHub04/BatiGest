import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getProfil: builder.query({
      query: () => '/auth/profil',
    }),
    modifierProfil: builder.mutation({
      query: (data) => ({
        url: '/auth/profil',
        method: 'PUT',
        body: data,
      }),
    }),
    changerMotDePasse: builder.mutation({
      query: (data) => ({
        url: '/auth/mot-de-passe',
        method: 'PUT',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, nouveauMotDePasse }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { nouveauMotDePasse },
      }),
    }),
    demandeSuppression: builder.mutation({
      query: (data) => ({
        url: '/auth/demande-suppression',
        method: 'POST',
        body: data,
      }),
    }),
    confirmDelete: builder.mutation({
      query: (token) => ({
        url: `/auth/confirm-delete/${token}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetProfilQuery,
  useModifierProfilMutation,
  useChangerMotDePasseMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useDemandeSuppressionMutation,
  useConfirmDeleteMutation,
} = authApiSlice;