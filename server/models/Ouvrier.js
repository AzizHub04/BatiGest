const mongoose = require('mongoose');

const ouvrierSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true
  },
  typeOuvrier: {
    type: String,
    required: [true, 'Le type est obligatoire'],
    trim: true
  },
  tarifJournalier: {
    type: Number,
    required: [true, 'Le tarif journalier est obligatoire'],
    min: 0
  },
  telephone: {
    type: String,
    trim: true,
    default: ''
  },
  statut: {
    type: String,
    enum: ['Actif', 'Inactif'],
    default: 'Actif'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ouvrier', ouvrierSchema);