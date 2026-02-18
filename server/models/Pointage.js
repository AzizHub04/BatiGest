const mongoose = require('mongoose');

const pointageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La date est obligatoire'],
    default: Date.now
  },
  typeJournee: {
    type: String,
    enum: ['Complète', 'Demi'],
    required: [true, 'Le type de journée est obligatoire']
  },
  // Relation "posséder" : le pointage appartient à un Ouvrier
  ouvrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ouvrier',
    required: true
  },
  // Relation "travailler" : le pointage est lié à un Chantier
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Pointage', pointageSchema);