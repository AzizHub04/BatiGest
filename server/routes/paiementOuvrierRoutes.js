const express = require('express');
const router = express.Router();
const {
  getPaiements,
  genererPaiement,
  payerPaiement,
  modifierPaiement,
  supprimerPaiement,
  getAutoResume,
  reglerPaiement
} = require('../controllers/paiementOuvrierController');
const { proteger, adminSeul } = require('../middlewares/authMiddleware');

router.get('/auto', proteger, adminSeul, getAutoResume);
router.post('/regler', proteger, adminSeul, reglerPaiement);
router.get('/', proteger, adminSeul, getPaiements);
router.post('/generer', proteger, adminSeul, genererPaiement);
router.put('/:id/payer', proteger, adminSeul, payerPaiement);
router.put('/:id', proteger, adminSeul, modifierPaiement);
router.delete('/:id', proteger, adminSeul, supprimerPaiement);

module.exports = router;
