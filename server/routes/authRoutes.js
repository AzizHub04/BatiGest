const express = require('express');
const router = express.Router();
const { register, login, logout, getProfil } = require('../controllers/authController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profil', proteger, getProfil);

module.exports = router;