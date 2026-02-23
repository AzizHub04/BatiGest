const express = require('express');
const router = express.Router();
const {
  getTachesByTravail,
  creerTache,
  modifierTache,
  changerStatut,
  supprimerTache
} = require('../controllers/tacheController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/travail/:travailId', proteger, getTachesByTravail);
router.post('/', proteger, creerTache);
router.put('/:id', proteger, modifierTache);
router.put('/:id/statut', proteger, changerStatut);
router.delete('/:id', proteger, supprimerTache);

module.exports = router;