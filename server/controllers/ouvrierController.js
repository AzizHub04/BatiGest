const Ouvrier = require('../models/Ouvrier');
const Pointage = require('../models/Pointage');
const PaiementOuvrier = require('../models/PaiementOuvrier');

// GET /api/ouvriers
const getOuvriers = async (req, res) => {
  try {
    const ouvriers = await Ouvrier.find({ admin: req.utilisateur._id }).sort({ createdAt: -1 });
    res.json(ouvriers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/ouvriers/:id
const getOuvrier = async (req, res) => {
  try {
    const ouvrier = await Ouvrier.findById(req.params.id);
    if (!ouvrier) return res.status(404).json({ message: 'Ouvrier non trouvé' });
    if (String(ouvrier.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    res.json(ouvrier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ouvriers
const creerOuvrier = async (req, res) => {
  try {
    const { nom, prenom, telephone, tarifJournalier } = req.body;

    const ouvrier = await Ouvrier.create({
      nom,
      prenom,
      telephone,
      tarifJournalier,
      admin: req.utilisateur._id
    });

    res.status(201).json({ message: 'Ouvrier créé avec succès', ouvrier });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/ouvriers/:id
const modifierOuvrier = async (req, res) => {
  try {
    const ouvrier = await Ouvrier.findById(req.params.id);
    if (!ouvrier) return res.status(404).json({ message: 'Ouvrier non trouvé' });
    if (String(ouvrier.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { nom, prenom, telephone, tarifJournalier, statut } = req.body;

    if (nom) ouvrier.nom = nom;
    if (prenom) ouvrier.prenom = prenom;
    if (telephone !== undefined) ouvrier.telephone = telephone;
    if (tarifJournalier !== undefined) ouvrier.tarifJournalier = tarifJournalier;
    if (statut) ouvrier.statut = statut;

    await ouvrier.save();
    res.json({ message: 'Ouvrier modifié avec succès', ouvrier });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/ouvriers/:id — suppression en cascade
const supprimerOuvrier = async (req, res) => {
  try {
    const ouvrier = await Ouvrier.findById(req.params.id);
    if (!ouvrier) return res.status(404).json({ message: 'Ouvrier non trouvé' });
    if (String(ouvrier.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Supprimer pointages et paiements associés
    await Pointage.deleteMany({ ouvrier: ouvrier._id });
    await PaiementOuvrier.deleteMany({ ouvrier: ouvrier._id });
    await ouvrier.deleteOne();

    res.json({ message: 'Ouvrier supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOuvriers,
  getOuvrier,
  creerOuvrier,
  modifierOuvrier,
  supprimerOuvrier
};