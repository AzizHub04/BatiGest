const Chantier = require('../models/Chantier');
const Utilisateur = require('../models/Utilisateur');
const Travail = require('../models/Travail');
const Tache = require('../models/Tache');
const NoteChantier = require('../models/NoteChantier');
const CoutPaiementChantier = require('../models/CoutPaiementChantier');

const calculerAvancement = async (chantierId) => {
  const travaux = await Travail.find({ chantier: chantierId });
  const travauxIds = travaux.map(t => t._id);
  const taches = await Tache.find({ travail: { $in: travauxIds } });

  let avancement = 0;
  const nbTravaux = travaux.length;

  if (nbTravaux > 0) {
    const poidsTravail = 100 / nbTravaux;
    let totalAvancement = 0;

    for (const travail of travaux) {
      const tachesDuTravail = taches.filter(t => String(t.travail) === String(travail._id));

      if (tachesDuTravail.length > 0) {
        const terminees = tachesDuTravail.filter(t => t.statut === 'Terminé').length;
        totalAvancement += (terminees / tachesDuTravail.length) * poidsTravail;
      } else {
        if (travail.etat === 'Terminé') totalAvancement += poidsTravail;
      }
    }

    avancement = Math.round(totalAvancement);
  }

  return avancement;
};

const calculerFinancement = async (chantierId) => {
  const couts = await CoutPaiementChantier.find({ chantier: chantierId });
  const totalDepense = couts.filter(c => c.type === 'Dépense').reduce((sum, c) => sum + c.montant, 0);
  const totalRecu = couts.filter(c => c.type === 'Règlement').reduce((sum, c) => sum + c.montant, 0);
  return { totalDepense, totalRecu };
};
// GET /api/chantiers
const getChantiers = async (req, res) => {
  try {
    let filtre = {};

    if (req.utilisateur.role === 'admin') {
      filtre = { admin: req.utilisateur._id };
    } else {
      filtre = { responsable: req.utilisateur._id };
    }

    const chantiers = await Chantier.find(filtre).populate('responsable', 'nom prenom email');

    // Calculer l'avancement pour chaque chantier
    const chantiersAvecAvancement = await Promise.all(
      chantiers.map(async (chantier) => {
        const avancement = await calculerAvancement(chantier._id);
        const { totalDepense, totalRecu } = await calculerFinancement(chantier._id);
        return { ...chantier.toObject(), avancement, totalDepense, totalRecu };
      })
    );

    res.json(chantiersAvecAvancement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chantiers/:id
const getChantier = async (req, res) => {
  try {
    const chantier = await Chantier.findById(req.params.id).populate('responsable', 'nom prenom email');

    if (!chantier) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }

    if (req.utilisateur.role === 'admin' && String(chantier.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    if (req.utilisateur.role === 'responsable' && String(chantier.responsable?._id) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Avancement
    const avancement = await calculerAvancement(chantier._id);
    const { totalDepense, totalRecu } = await calculerFinancement(chantier._id);

    res.json({ ...chantier.toObject(), avancement, totalDepense, totalRecu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chantiers
const creerChantier = async (req, res) => {
  try {
    const { nom, localisation, dateDebut, dateFinPrevue, budget, etat, responsable } = req.body;

    if (responsable) {
      const user = await Utilisateur.findById(responsable);
      if (!user || user.role !== 'responsable' || String(user.admin) !== String(req.utilisateur._id)) {
        return res.status(400).json({ message: 'Responsable invalide' });
      }
    }

    const chantier = await Chantier.create({
      nom,
      localisation,
      dateDebut,
      dateFinPrevue,
      budget,
      etat: etat || 'Planifié',
      responsable: responsable || null,
      admin: req.utilisateur._id
    });

    await chantier.populate('responsable', 'nom prenom email');

    const io = req.app.get('io');
    io.emit('chantier-added', chantier);

    res.status(201).json({ message: 'Chantier créé avec succès', chantier: { ...chantier.toObject(), avancement: 0, totalDepense: 0 } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/chantiers/:id
const modifierChantier = async (req, res) => {
  try {
    const chantier = await Chantier.findById(req.params.id);

    if (!chantier) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }

    if (String(chantier.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { nom, localisation, dateDebut, dateFinPrevue, budget, etat, responsable } = req.body;

    if (responsable) {
      const user = await Utilisateur.findById(responsable);
      if (!user || user.role !== 'responsable' || String(user.admin) !== String(req.utilisateur._id)) {
        return res.status(400).json({ message: 'Responsable invalide' });
      }
    }

    if (nom) chantier.nom = nom;
    if (localisation) chantier.localisation = localisation;
    if (dateDebut) chantier.dateDebut = dateDebut;
    if (dateFinPrevue) chantier.dateFinPrevue = dateFinPrevue;
    if (budget !== undefined) chantier.budget = budget;
    if (etat) chantier.etat = etat;
    if (responsable !== undefined) chantier.responsable = responsable || null;

    await chantier.save();
    await chantier.populate('responsable', 'nom prenom email');

    const io = req.app.get('io');
    io.to(`chantier-${chantier._id}`).emit('chantier-updated');

    res.json({ message: 'Chantier modifié avec succès', chantier });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/chantiers/:id — Suppression en cascade
const supprimerChantier = async (req, res) => {
  try {
    const chantier = await Chantier.findById(req.params.id);

    if (!chantier) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }

    if (String(chantier.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Cascade : tâches → travaux → notes → coûts → chantier
    const travaux = await Travail.find({ chantier: chantier._id });
    const travauxIds = travaux.map(t => t._id);

    await Tache.deleteMany({ travail: { $in: travauxIds } });
    await Travail.deleteMany({ chantier: chantier._id });
    await NoteChantier.deleteMany({ chantier: chantier._id });
    await CoutPaiementChantier.deleteMany({ chantier: chantier._id });
    await chantier.deleteOne();

    const io = req.app.get('io');
    io.emit('chantier-deleted', { id: req.params.id });

    res.json({ message: 'Chantier et données associées supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/chantiers/:id/etat
const changerEtat = async (req, res) => {
  try {
    const chantier = await Chantier.findById(req.params.id);

    if (!chantier) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }

    if (req.utilisateur.role === 'admin' && String(chantier.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    if (req.utilisateur.role === 'responsable' && String(chantier.responsable) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { etat } = req.body;
    const etatsValides = ['Planifié', 'En cours', 'En retard', 'Terminé', 'Suspendu'];

    if (!etatsValides.includes(etat)) {
      return res.status(400).json({ message: 'État invalide' });
    }

    chantier.etat = etat;
    await chantier.save();
    await chantier.populate('responsable', 'nom prenom email');

    const io = req.app.get('io');
    io.to(`chantier-${chantier._id}`).emit('chantier-updated');

    res.json({ message: `État changé à "${etat}"`, chantier });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/chantiers/responsable/:id — Trouver le chantier assigné à un responsable
const getChantierByResponsable = async (req, res) => {
  try {
    const chantier = await Chantier.findOne({ responsable: req.params.id });
    if (!chantier) {
      return res.json(null);
    }

    const avancement = await calculerAvancement(chantier._id);

    res.json({ ...chantier.toObject(), avancement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChantiers,
  getChantier,
  creerChantier,
  modifierChantier,
  supprimerChantier,
  changerEtat,
  getChantierByResponsable
};