const mongoose = require('mongoose');

const noteChantierSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu est obligatoire'],
    trim: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  // Relation "écrire" : l'auteur de la note
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  // Composition : la note appartient à un Chantier
  chantier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chantier',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('NoteChantier', noteChantierSchema);