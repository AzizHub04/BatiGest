const mongoose = require('mongoose');

const materielChantierSchema = new mongoose.Schema({
  quantite: {
    type: Number,
    required: [true, 'La quantité est obligatoire'],
    min: 1
  },
  dateMouvement: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  typeMouvement: {
    type: String,
    enum: ['Sortie', 'Entrée'],
    required: [true, 'Le type de mouvement est obligatoire']
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  materiel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materiel',
    required: true
  },
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MaterielChantier', materielChantierSchema);