const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  statut: {
    type: String,
    enum: ['Non commencé', 'En cours', 'Terminé'],
    default: 'Non commencé'
  },
  priorite: {
    type: String,
    enum: ['Haute', 'Moyenne', 'Basse'],
    default: 'Moyenne'
  },
  // Composition : une Tâche appartient à un Travail
  travail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Travail',
    required: [true, 'Le travail est obligatoire']
  }
}, { timestamps: true });

module.exports = mongoose.model('Tache', tacheSchema);