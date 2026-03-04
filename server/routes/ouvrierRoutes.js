const express = require('express');
const router = express.Router();
const { getOuvriers, getOuvrier, creerOuvrier, modifierOuvrier, supprimerOuvrier } = require('../controllers/ouvrierController');
const { proteger, adminSeul } = require('../middlewares/authMiddleware');

router.get('/', proteger, adminSeul, getOuvriers);
router.get('/:id', proteger, adminSeul, getOuvrier);
router.post('/', proteger, adminSeul, creerOuvrier);
router.put('/:id', proteger, adminSeul, modifierOuvrier);
router.delete('/:id', proteger, adminSeul, supprimerOuvrier);

module.exports = router;