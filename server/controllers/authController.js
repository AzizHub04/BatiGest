const Utilisateur = require('../models/Utilisateur');
const jwt = require('jsonwebtoken');

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

module.exports = { register, login, logout, getProfil };