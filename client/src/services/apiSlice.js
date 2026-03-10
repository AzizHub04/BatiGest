import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/constants';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Utilisateur', 'Chantier', 'Travail', 'Tache', 'Ouvrier', 'Pointage', 'Paiement', 'Materiel', 'Mouvement', 'Note', 'Notification', 'Financement', 'Responsable'],
  endpoints: () => ({}),
});