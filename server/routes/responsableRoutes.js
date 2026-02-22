const express = require('express');
const router = express.Router();
const {
  getResponsables,
  getResponsable,
  creerResponsable,
  modifierResponsable,
  supprimerResponsable
} = require('../controllers/responsableController');
const { proteger, adminSeul } = require('../middlewares/authMiddleware');

// Toutes les routes sont protégées + admin seulement
router.get('/', proteger, adminSeul, getResponsables);
router.get('/:id', proteger, adminSeul, getResponsable);
router.post('/', proteger, adminSeul, creerResponsable);
router.put('/:id', proteger, adminSeul, modifierResponsable);
router.delete('/:id', proteger, adminSeul, supprimerResponsable);

module.exports = router;