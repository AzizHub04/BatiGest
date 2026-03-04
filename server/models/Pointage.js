const mongoose = require('mongoose');

const pointageSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'La date est obligatoire']
  },
  // Soit un ouvrier, soit un responsable (utilisateur)
  ouvrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ouvrier',
    default: null
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    default: null
  },
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    default: null  // null = absent (croix)
  },
  demiJournee: {
    type: Boolean,
    default: false
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
}, { timestamps: true });

// Un ouvrier/responsable ne peut avoir qu'un seul pointage par jour
pointageSchema.index({ date: 1, ouvrier: 1 }, { unique: true, sparse: true });
pointageSchema.index({ date: 1, responsable: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Pointage', pointageSchema);
