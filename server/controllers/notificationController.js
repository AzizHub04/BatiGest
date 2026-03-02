const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ utilisateur: req.utilisateur._id })
      .populate('chantier', 'nom')
      .sort({ createdAt: -1 })
      .limit(20);

    const nonLues = await Notification.countDocuments({ utilisateur: req.utilisateur._id, estLue: false });

    res.json({ notifications, nonLues });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/lire-tout
const marquerToutLu = async (req, res) => {
  try {
    await Notification.updateMany(
      { utilisateur: req.utilisateur._id, estLue: false },
      { estLue: true }
    );
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/:id/lire
const marquerLu = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification non trouvée' });

    if (String(notification.utilisateur) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    notification.estLue = true;
    await notification.save();
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notifications/:id
const supprimerNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification non trouvée' });

    if (String(notification.utilisateur) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notifications
const supprimerTout = async (req, res) => {
  try {
    await Notification.deleteMany({ utilisateur: req.utilisateur._id });
    res.json({ message: 'Toutes les notifications supprimées' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  marquerToutLu,
  marquerLu,
  supprimerNotification,
  supprimerTout
};