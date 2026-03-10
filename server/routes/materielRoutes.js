const express = require('express');
const router = express.Router();
const {
  getMateriels,
  getMateriel,
  creerMateriel,
  modifierMateriel,
  supprimerMateriel
} = require('../controllers/materielController');
const { proteger, adminSeul } = require('../middlewares/authMiddleware');

router.get('/', proteger, adminSeul, getMateriels);
router.get('/:id', proteger, adminSeul, getMateriel);
router.post('/', proteger, adminSeul, creerMateriel);
router.put('/:id', proteger, adminSeul, modifierMateriel);
router.delete('/:id', proteger, adminSeul, supprimerMateriel);

module.exports = router;