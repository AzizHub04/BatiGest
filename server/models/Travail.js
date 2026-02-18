const mongoose = require('mongoose');

const travailSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  etat: {
    type: String,
    enum: ['Non commencé', 'En cours', 'Terminé'],
    default: 'Non commencé'
  },
  // Relation composition : un Travail appartient à un Chantier
  // Si le chantier est supprimé, ses travaux aussi (géré dans le controller)
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: [true, 'Le chantier est obligatoire']
  }
}, { timestamps: true });

module.exports = mongoose.model('Travail', travailSchema);