const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Le message est obligatoire'],
    trim: true
  },
  dateEnvoi: {
    type: Date,
    default: Date.now
  },
  estLue: {
    type: Boolean,
    default: false
  },
  // Relation "recevoir" : la notification appartient à un Utilisateur
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);