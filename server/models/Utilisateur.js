const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      },
      message: 'Format email invalide (ex: nom@domaine.com)'
    }
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [8, 'Minimum 8 caractères'],
    validate: {
      validator: function(value) {
        // Valider seulement si le mot de passe est nouveau (pas un hash bcrypt)
        if (value.startsWith('$2a$') || value.startsWith('$2b$')) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,;:#_\-])[A-Za-z\d@$!%*?&.,;:#_\-]{8,}$/.test(value);
      },
      message: 'Doit contenir : 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'responsable'],
    required: true
  },
  tarifJournalier: {
    type: Number,
    default: null,
    min: 0
  },
  // L'admin qui a créé ce responsable
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    default: null
  }
}, { timestamps: true });

// Hacher le mot de passe avant sauvegarde
utilisateurSchema.pre('save', async function() {
  if (!this.isModified('motDePasse')) return;
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

// Comparer mot de passe lors du login
utilisateurSchema.methods.comparerMotDePasse = async function(motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);