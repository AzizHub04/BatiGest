const express = require('express');
const router = express.Router();
const {
  getMouvements,
  creerMouvement,
  modifierMouvement,
  supprimerMouvement
} = require('../controllers/materielChantierController');
const { proteger, adminSeul } = require('../middlewares/authMiddleware');
const { getMateriauxChantier } = require('../controllers/materielChantierController');

router.get('/chantier/:chantierId', proteger, getMateriauxChantier);

router.get('/', proteger, adminSeul, getMouvements);
router.post('/', proteger, adminSeul, creerMouvement);
router.put('/:id', proteger, adminSeul, modifierMouvement);
router.delete('/:id', proteger, adminSeul, supprimerMouvement);

module.exports = router;