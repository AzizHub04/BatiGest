const mongoose = require('mongoose');

const paiementOuvrierSchema = new mongoose.Schema({
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est obligatoire']
  },
  dateFin: {
    type: Date,
    required: [true, 'La date de fin est obligatoire']
  },
  montantTotal: {
    type: Number,
    required: true,
    min: 0
  },
  montantPaye: {
    type: Number,
    default: 0,
    min: 0
  },
  montantRestant: {
    type: Number,
    default: 0,
    min: 0
  },
  statutPaiement: {
    type: String,
    enum: ['Payé', 'Partiel', 'Non payé'],
    default: 'Non payé'
  },
  datePaiement: {
    type: Date,
    default: null
  },
  // Relation : le paiement appartient à un Ouvrier
  ouvrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ouvrier',
    required: true
  },
  // Relation "baser sur" : les pointages utilisés pour ce paiement
  pointages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pointage'
  }]
}, { timestamps: true });

module.exports = mongoose.model('PaiementOuvrier', paiementOuvrierSchema);