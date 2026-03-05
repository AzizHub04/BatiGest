const mongoose = require('mongoose');

const pointageSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'La date est obligatoire']
  },
  // Soit un ouvrier, soit un responsable (utilisateur)
  ouvrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ouvrier'
    // No default — field must be absent (not null) when unused,
    // so the partial index below can correctly ignore it.
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
    // No default — same reason as above.
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

// Un ouvrier/responsable ne peut avoir qu'un seul pointage par jour.
// Use partialFilterExpression instead of sparse — sparse compound indexes
// don't work as expected because MongoDB includes documents where at least
// one indexed field exists (date is always present, so every doc is indexed).
pointageSchema.index(
  { date: 1, ouvrier: 1 },
  { unique: true, partialFilterExpression: { ouvrier: { $exists: true } } }
);
pointageSchema.index(
  { date: 1, responsable: 1 },
  { unique: true, partialFilterExpression: { responsable: { $exists: true } } }
);

module.exports = mongoose.model('Pointage', pointageSchema);
