import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Utilisateur', 'Chantier', 'Travail', 'Tache', 'Ouvrier', 'Pointage', 'Paiement', 'Materiel', 'Mouvement', 'Note', 'Notification', 'Financement', 'Responsable'],
  endpoints: () => ({}),
});