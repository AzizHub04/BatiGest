const express = require('express');
const router = express.Router();
const {
  getNotesByChantier,
  creerNote,
  modifierNote,
  supprimerNote
} = require('../controllers/noteChantierController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/chantier/:chantierId', proteger, getNotesByChantier);
router.post('/', proteger, creerNote);
router.put('/:id', proteger, modifierNote);
router.delete('/:id', proteger, supprimerNote);

module.exports = router;
