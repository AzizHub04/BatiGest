const mongoose = require('mongoose');

const coutPaiementChantierSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Dépense', 'Règlement'],
    required: [true, 'Le type est obligatoire']
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est obligatoire'],
    min: 0
  },
  dateOperation: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  modePaiement: {
    type: String,
    enum: ['Espèces', 'Virement', 'Chèque', 'Autre'],
    required: true
  },
  // Composition : ce coût appartient à un Chantier
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CoutPaiementChantier', coutPaiementChantierSchema);