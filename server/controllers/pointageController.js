const Pointage = require('../models/Pointage');
const Ouvrier = require('../models/Ouvrier');
const Utilisateur = require('../models/Utilisateur');
const Chantier = require('../models/Chantier');

// GET /api/pointages?mois=2026-03
const getPointages = async (req, res) => {
  try {
    const { mois } = req.query; // format: "2026-03"
    if (!mois) return res.status(400).json({ message: 'Le mois est obligatoire (format: YYYY-MM)' });

    const pointages = await Pointage.find({
      admin: req.utilisateur._id,
      date: { $regex: `^${mois}` }
    })
    .populate('ouvrier', 'nom prenom tarifJournalier')
    .populate('responsable', 'nom prenom tarifJournalier')
    .populate('chantier', 'nom');

    res.json(pointages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/pointages — Créer ou modifier un pointage
const setPointage = async (req, res) => {
  try {
    const { date, ouvrierId, responsableId, chantierId, demiJournee } = req.body;

    if (!date) return res.status(400).json({ message: 'La date est obligatoire' });
    if (!ouvrierId && !responsableId) {
      return res.status(400).json({ message: 'Ouvrier ou responsable requis' });
    }

    let chantierFinal = chantierId;

    // Si c'est un responsable, récupérer automatiquement son chantier assigné
    // seulement si chantierId n'est pas du tout présent dans le body
    if (responsableId && chantierId === undefined) {
      const chantier = await Chantier.findOne({ responsable: responsableId });
      if (chantier) chantierFinal = chantier._id;
    }

    const filtre = { date, admin: req.utilisateur._id };
    if (ouvrierId) filtre.ouvrier = ouvrierId;
    if (responsableId) filtre.responsable = responsableId;

    const pointage = await Pointage.findOneAndUpdate(
      filtre,
      {
        date,
        ouvrier: ouvrierId || null,
        responsable: responsableId || null,
        chantier: chantierFinal || null,
        demiJournee: demiJournee || false,
        admin: req.utilisateur._id
      },
      { upsert: true, new: true }
    )
    .populate('ouvrier', 'nom prenom tarifJournalier')
    .populate('responsable', 'nom prenom tarifJournalier')
    .populate('chantier', 'nom');

    res.json(pointage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/pointages — Supprimer un pointage (remettre vide)
const supprimerPointage = async (req, res) => {
  try {
    const { date, ouvrierId, responsableId } = req.body;

    const filtre = { date, admin: req.utilisateur._id };
    if (ouvrierId) filtre.ouvrier = ouvrierId;
    if (responsableId) filtre.responsable = responsableId;

    await Pointage.findOneAndDelete(filtre);

    res.json({ message: 'Pointage supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPointages,
  setPointage,
  supprimerPointage
};
