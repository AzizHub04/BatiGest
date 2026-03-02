const express = require('express');
const router = express.Router();
const {
  getNotifications,
  marquerToutLu,
  marquerLu,
  supprimerNotification,
  supprimerTout
} = require('../controllers/notificationController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/', proteger, getNotifications);
router.put('/lire-tout', proteger, marquerToutLu);
router.put('/:id/lire', proteger, marquerLu);
router.delete('/tout', proteger, supprimerTout);
router.delete('/:id', proteger, supprimerNotification);

module.exports = router;