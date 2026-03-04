const express = require('express');
const router = express.Router();
const { getPointages, setPointage, supprimerPointage } = require('../controllers/pointageController');
const { proteger, adminSeul } = require('../middlewares/authMiddleware');

router.get('/', proteger, adminSeul, getPointages);
router.post('/', proteger, adminSeul, setPointage);
router.delete('/', proteger, adminSeul, supprimerPointage);

module.exports = router;