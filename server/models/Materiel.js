const mongoose = require('mongoose');

const materielSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    trim: true
  },
  unite: {
    type: String,
    required: [true, 'L\'unité est obligatoire'],
    trim: true
  },
  quantiteStock: {
    type: Number,
    default: 0,
    min: 0
  },
  quantiteDehors: {
    type: Number,
    default: 0,
    min: 0
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Materiel', materielSchema);