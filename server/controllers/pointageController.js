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

    // Build $set/$unset dynamically — never store null on the unused
    // person field, because MongoDB's sparse unique index treats null
    // as a real value and causes duplicate-key errors.
    const $set = {
      date,
      chantier: chantierFinal || null,
      demiJournee: demiJournee || false,
      admin: req.utilisateur._id
    };
    const $unset = {};

    if (ouvrierId) {
      $set.ouvrier = ouvrierId;
      $unset.responsable = '';
    } else {
      $set.responsable = responsableId;
      $unset.ouvrier = '';
    }

    const pointage = await Pointage.findOneAndUpdate(
      filtre,
      { $set, $unset },
      { upsert: true, returnDocument: 'after' }
    )
      .populate('ouvrier', 'nom prenom tarifJournalier')
      .populate('responsable', 'nom prenom tarifJournalier')
      .populate('chantier', 'nom');

    if (chantierFinal) {
      const io = req.app.get('io');
      io.to(`chantier-${chantierFinal}`).emit('pointage-updated');
    }
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

    const io = req.app.get('io');
    io.emit('pointage-updated');
    
    res.json({ message: 'Pointage supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/pointages/chantier/:chantierId/presents — ouvriers présents aujourd'hui ou ce mois
const getOuvriersPresents = async (req, res) => {
  try {
    const { chantierId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const moisActuel = today.substring(0, 7);

    // Pointages du mois en cours pour ce chantier
    const pointages = await Pointage.find({
      chantier: chantierId,
      date: { $regex: `^${moisActuel}` }
    })
    .populate('ouvrier', 'nom prenom telephone tarifJournalier')
    .populate('responsable', 'nom prenom telephone');

    // Grouper par personne
    const personneMap = {};
    pointages.forEach(p => {
      const personne = p.ouvrier || p.responsable;
      if (!personne) return;
      const pid = String(personne._id);
      const type = p.ouvrier ? 'ouvrier' : 'responsable';

      if (!personneMap[pid]) {
        personneMap[pid] = {
          personne,
          type,
          joursTotal: 0,
          presentAujourdhui: false
        };
      }
      personneMap[pid].joursTotal += p.demiJournee ? 0.5 : 1;
      if (p.date === today) {
        personneMap[pid].presentAujourdhui = true;
      }
    });

    res.json(Object.values(personneMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPointages,
  setPointage,
  supprimerPointage,
  getOuvriersPresents
};
