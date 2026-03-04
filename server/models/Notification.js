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
  estLue: {
    type: Boolean,
    default: false
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: true
  },
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NoteChantier',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);