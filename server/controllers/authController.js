const Utilisateur = require('../models/Utilisateur');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { envoyerEmailReset, envoyerEmailSuppression } = require('../config/email');

// Générer un token JWT et l'envoyer dans un cookie
const genererToken = (res, id, role) => {
  const token = jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 jours
  });

  return token;
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    const existe = await Utilisateur.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }

    const utilisateur = await Utilisateur.create({
      nom, prenom, email, motDePasse, role
    });

    genererToken(res, utilisateur._id, utilisateur.role);

    res.status(201).json({
      message: 'Compte créé avec succès',
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Comparer le mot de passe
    const motDePasseValide = await utilisateur.comparerMotDePasse(motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    genererToken(res, utilisateur._id, utilisateur.role);

    res.json({
      message: 'Connexion réussie',
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Déconnexion réussie' });
};

// GET /api/auth/profil
const getProfil = async (req, res) => {
  res.json({
    utilisateur: {
      id: req.utilisateur._id,
      nom: req.utilisateur.nom,
      prenom: req.utilisateur.prenom,
      email: req.utilisateur.email,
      role: req.utilisateur.role
    }
  });
};

// PUT /api/auth/profil — Modifier le profil
const modifierProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur._id);
    const { nom, prenom, email } = req.body;

    // Vérifier si le nouvel email existe déjà
    if (email && email !== utilisateur.email) {
      const emailExiste = await Utilisateur.findOne({ email });
      if (emailExiste) {
        return res.status(400).json({ message: 'Cet email existe déjà' });
      }
    }

    if (nom) utilisateur.nom = nom;
    if (prenom) utilisateur.prenom = prenom;
    if (email) utilisateur.email = email;

    await utilisateur.save();

    res.json({
      message: 'Profil modifié avec succès',
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/auth/mot-de-passe — Changer le mot de passe
const changerMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const utilisateur = await Utilisateur.findById(req.utilisateur._id);

    // Vérifier l'ancien mot de passe
    const valide = await utilisateur.comparerMotDePasse(ancienMotDePasse);
    if (!valide) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    utilisateur.motDePasse = nouveauMotDePasse;
    await utilisateur.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/auth/compte — Supprimer son compte
const supprimerCompte = async (req, res) => {
  try {
    const { motDePasse } = req.body;
    const utilisateur = await Utilisateur.findById(req.utilisateur._id);

    // Confirmer avec le mot de passe
    const valide = await utilisateur.comparerMotDePasse(motDePasse);
    if (!valide) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    await utilisateur.deleteOne();

    // Supprimer le cookie
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password — Demander réinitialisation
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Aucun compte avec cet email' });
    }

    // Générer un token aléatoire
    const token = crypto.randomBytes(32).toString('hex');
    utilisateur.resetToken = token;
    utilisateur.resetTokenExpire = Date.now() + 3600000; // 1 heure
    await utilisateur.save();

    await envoyerEmailReset(email, token);

    res.json({ message: 'Email de réinitialisation envoyé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password/:token — Réinitialiser le mot de passe
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { nouveauMotDePasse } = req.body;

    const utilisateur = await Utilisateur.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Lien invalide ou expiré' });
    }

    utilisateur.motDePasse = nouveauMotDePasse;
    utilisateur.resetToken = null;
    utilisateur.resetTokenExpire = null;
    await utilisateur.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/auth/demande-suppression — Demander suppression de compte
const demandeSuppression = async (req, res) => {
  try {
    const { motDePasse } = req.body;
    const utilisateur = await Utilisateur.findById(req.utilisateur._id);

    // Vérifier le mot de passe
    const valide = await utilisateur.comparerMotDePasse(motDePasse);
    if (!valide) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Générer un token
    const token = crypto.randomBytes(32).toString('hex');
    utilisateur.deleteToken = token;
    utilisateur.deleteTokenExpire = Date.now() + 3600000; // 1 heure
    await utilisateur.save();

    await envoyerEmailSuppression(utilisateur.email, token);

    res.json({ message: 'Email de confirmation envoyé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/auth/confirm-delete/:token — Confirmer suppression
const confirmDelete = async (req, res) => {
  try {
    const { token } = req.params;

    const utilisateur = await Utilisateur.findOne({
      deleteToken: token,
      deleteTokenExpire: { $gt: Date.now() }
    });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Lien invalide ou expiré' });
    }

    await utilisateur.deleteOne();

    // Supprimer le cookie
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifierSession = async (req, res) => {
  try {
    res.json({ utilisateur: req.utilisateur });
  } catch (error) {
    res.status(401).json({ message: 'Session invalide' });
  }
};

module.exports = { register, login, logout, getProfil, modifierProfil, changerMotDePasse, supprimerCompte, forgotPassword, resetPassword, demandeSuppression, confirmDelete,verifierSession };