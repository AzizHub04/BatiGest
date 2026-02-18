const mongoose = require('mongoose');

const materielChantierSchema = new mongoose.Schema({
  quantite: {
    type: Number,
    required: [true, 'La quantité est obligatoire'],
    min: 0
  },
  dateMouvement: {
    type: Date,
    default: Date.now
  },
  typeMouvement: {
    type: String,
    enum: ['Entrée', 'Sortie'],
    required: [true, 'Le type de mouvement est obligatoire']
  },
  // Relation "utiliser" : mouvement lié à un Matériel
  materiel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materiel',
    required: true
  },
  // Relation "utiliser" : mouvement lié à un Chantier
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MaterielChantier', materielChantierSchema);