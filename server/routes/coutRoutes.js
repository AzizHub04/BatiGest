const express = require('express');
const router = express.Router();
const {
  getCoutsByChantier,
  creerCout,
  modifierCout,
  supprimerCout
} = require('../controllers/coutPaiementController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/chantier/:chantierId', proteger, getCoutsByChantier);
router.post('/', proteger, creerCout);
router.put('/:id', proteger, modifierCout);
router.delete('/:id', proteger, supprimerCout);

module.exports = router;