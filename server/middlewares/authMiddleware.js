const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Vérifier que l'utilisateur est connecté (token valide)
const proteger = async (req, res, next) => {
  try {
    // Lire le token depuis le cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Non autorisé, pas de token' });
    }

    // Déchiffrer le token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base (sans le mot de passe)
    req.utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');

    if (!req.utilisateur) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Vérifier le rôle (admin seulement)
const adminSeul = (req, res, next) => {
  if (req.utilisateur && req.utilisateur.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès réservé à l\'admin' });
  }
};

// Vérifier le rôle (responsable seulement)
const responsableSeul = (req, res, next) => {
  if (req.utilisateur && req.utilisateur.role === 'responsable') {
    next();
  } else {
    res.status(403).json({ message: 'Accès réservé au responsable' });
  }
};

module.exports = { proteger, adminSeul, responsableSeul };