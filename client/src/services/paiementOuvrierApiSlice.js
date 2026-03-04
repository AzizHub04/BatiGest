import { apiSlice } from './apiSlice';

export const paiementOuvrierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaiements: builder.query({
      query: ({ ouvrierId, responsableId }) => {
        let url = '/paiements-ouvriers?';
        if (ouvrierId) url += `ouvrierId=${ouvrierId}`;
        if (responsableId) url += `responsableId=${responsableId}`;
        return url;
      },
      providesTags: ['PaiementOuvrier'],
    }),
    getAutoResume: builder.query({
      query: ({ ouvrierId, responsableId }) => {
        let url = '/paiements-ouvriers/auto?';
        if (ouvrierId) url += `ouvrierId=${ouvrierId}`;
        if (responsableId) url += `responsableId=${responsableId}`;
        return url;
      },
      providesTags: ['PaiementOuvrier'],
    }),
    genererPaiement: builder.mutation({
      query: (data) => ({ url: '/paiements-ouvriers/generer', method: 'POST', body: data }),
      invalidatesTags: ['PaiementOuvrier'],
    }),
    reglerPaiement: builder.mutation({
      query: (data) => ({ url: '/paiements-ouvriers/regler', method: 'POST', body: data }),
      invalidatesTags: ['PaiementOuvrier'],
    }),
    payerPaiement: builder.mutation({
      query: ({ id, montant }) => ({ url: `/paiements-ouvriers/${id}/payer`, method: 'PUT', body: { montant } }),
      invalidatesTags: ['PaiementOuvrier'],
    }),
    modifierPaiement: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/paiements-ouvriers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['PaiementOuvrier'],
    }),
    supprimerPaiement: builder.mutation({
      query: (id) => ({ url: `/paiements-ouvriers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['PaiementOuvrier'],
    }),
  }),
});

export const {
  useGetPaiementsQuery,
  useGetAutoResumeQuery,
  useGenererPaiementMutation,
  useReglerPaiementMutation,
  usePayerPaiementMutation,
  useModifierPaiementMutation,
  useSupprimerPaiementMutation,
} = paiementOuvrierApiSlice;
