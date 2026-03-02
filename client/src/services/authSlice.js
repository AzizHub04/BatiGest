import { createSlice } from '@reduxjs/toolkit';

// Récupérer l'utilisateur du localStorage au démarrage
const utilisateurFromStorage = localStorage.getItem('utilisateur')
  ? JSON.parse(localStorage.getItem('utilisateur'))
  : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    utilisateur: utilisateurFromStorage,
  },
  reducers: {
    setUtilisateur: (state, action) => {
      state.utilisateur = action.payload;
      localStorage.setItem('utilisateur', JSON.stringify(action.payload));
    },
    clearUtilisateur: (state) => {
      state.utilisateur = null;
      localStorage.removeItem('utilisateur');
    },
  },
});

export const { setUtilisateur, clearUtilisateur } = authSlice.actions;
export default authSlice.reducer;