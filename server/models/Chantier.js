const mongoose = require('mongoose');

const chantierSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du chantier est obligatoire'],
    trim: true
  },
  localisation: {
    type: String,
    required: [true, 'La localisation est obligatoire'],
    trim: true
  },
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est obligatoire']
  },
  dateFinPrevue: {
    type: Date,
    required: [true, 'La date de fin prévue est obligatoire']
  },
  budget: {
    type: Number,  // Float dans le diagramme = Number en MongoDB
    required: [true, 'Le budget est obligatoire'],
    min: 0
  },
  etat: {
    type: String,
    enum: ['Planifié', 'En cours', 'En retard', 'Terminé', 'Suspendu'],
    default: 'Planifié'
  },
  // Relation : Chantier est géré par un Responsable (Utilisateur)
  // ref: 'Utilisateur' = c'est une clé étrangère vers la collection Utilisateur
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    default: null  // peut ne pas avoir de responsable au début
  }
}, { timestamps: true });

module.exports = mongoose.model('Chantier', chantierSchema);