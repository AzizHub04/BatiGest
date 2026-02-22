const express = require('express');
const router = express.Router();
const { register, login, logout, getProfil, modifierProfil, changerMotDePasse, supprimerCompte } = require('../controllers/authController');
const { proteger } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.post('/logout', proteger, logout);
router.get('/profil', proteger, getProfil);
router.put('/profil', proteger, modifierProfil);
router.put('/mot-de-passe', proteger, changerMotDePasse);
router.delete('/compte', proteger, supprimerCompte);

module.exports = router;