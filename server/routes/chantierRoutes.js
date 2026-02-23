const express = require('express');
const router = express.Router();
const {
  getChantiers,
  getChantier,
  creerChantier,
  modifierChantier,
  supprimerChantier,
  changerEtat,
  getChantierByResponsable
} = require('../controllers/chantierController');
const { proteger, adminSeul } = require('../middlewares/authMiddleware');

router.get('/', proteger, getChantiers);
router.get('/responsable/:id', proteger, getChantierByResponsable);
router.get('/:id', proteger, getChantier);
router.post('/', proteger, adminSeul, creerChantier);
router.put('/:id', proteger, adminSeul, modifierChantier);
router.delete('/:id', proteger, adminSeul, supprimerChantier);
router.put('/:id/etat', proteger, changerEtat);

module.exports = router;