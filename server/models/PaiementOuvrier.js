const mongoose = require('mongoose');

const paiementOuvrierSchema = new mongoose.Schema({
  dateDebut: {
    type: String,
    required: [true, 'La date de début est obligatoire']
  },
  dateFin: {
    type: String,
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
  pointages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pointage'
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PaiementOuvrier', paiementOuvrierSchema);