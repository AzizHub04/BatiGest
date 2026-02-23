const express = require('express');
const router = express.Router();
const {
  getTravauxByChantier,
  getTravail,
  creerTravail,
  modifierTravail,
  supprimerTravail
} = require('../controllers/travailController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/chantier/:chantierId', proteger, getTravauxByChantier);
router.get('/:id', proteger, getTravail);
router.post('/', proteger, creerTravail);
router.put('/:id', proteger, modifierTravail);
router.delete('/:id', proteger, supprimerTravail);

module.exports = router;