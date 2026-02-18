import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    utilisateur: null,
  },
  reducers: {
    setUtilisateur: (state, action) => {
      state.utilisateur = action.payload;
    },
    clearUtilisateur: (state) => {
      state.utilisateur = null;
    },
  },
});

export const { setUtilisateur, clearUtilisateur } = authSlice.actions;
export default authSlice.reducer;