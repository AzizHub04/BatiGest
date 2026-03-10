const Materiel = require('../models/Materiel');
const MaterielChantier = require('../models/MaterielChantier');

// GET /api/materiels
const getMateriels = async (req, res) => {
  try {
    const materiels = await Materiel.find({ admin: req.utilisateur._id }).sort({ createdAt: -1 });
    res.json(materiels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/materiels/:id
const getMateriel = async (req, res) => {
  try {
    const materiel = await Materiel.findById(req.params.id);
    if (!materiel) return res.status(404).json({ message: 'Matériel non trouvé' });
    if (String(materiel.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    res.json(materiel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/materiels
const creerMateriel = async (req, res) => {
  try {
    const { nom, categorie, unite, quantiteStock } = req.body;

    const materiel = await Materiel.create({
      nom,
      categorie,
      unite,
      quantiteStock: quantiteStock || 0,
      quantiteDehors: 0,
      admin: req.utilisateur._id
    });

    res.status(201).json({ message: 'Matériel créé avec succès', materiel });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/materiels/:id
const modifierMateriel = async (req, res) => {
  try {
    const materiel = await Materiel.findById(req.params.id);
    if (!materiel) return res.status(404).json({ message: 'Matériel non trouvé' });
    if (String(materiel.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { nom, categorie, unite, quantiteStock } = req.body;

    if (nom) materiel.nom = nom;
    if (categorie) materiel.categorie = categorie;
    if (unite) materiel.unite = unite;
    if (quantiteStock !== undefined) materiel.quantiteStock = quantiteStock;

    await materiel.save();
    res.json({ message: 'Matériel modifié avec succès', materiel });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/materiels/:id — suppression en cascade
const supprimerMateriel = async (req, res) => {
  try {
    const materiel = await Materiel.findById(req.params.id);
    if (!materiel) return res.status(404).json({ message: 'Matériel non trouvé' });
    if (String(materiel.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await MaterielChantier.deleteMany({ materiel: materiel._id });
    await materiel.deleteOne();

    res.json({ message: 'Matériel supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMateriels,
  getMateriel,
  creerMateriel,
  modifierMateriel,
  supprimerMateriel
};