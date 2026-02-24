const Travail = require('../models/Travail');
const Tache = require('../models/Tache');
const Chantier = require('../models/Chantier');

// Vérifier l'accès au chantier
const verifierAccesChantier = async (chantierId, utilisateur) => {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return false;

  if (utilisateur.role === 'admin' && String(chantier.admin) !== String(utilisateur._id)) return false;
  if (utilisateur.role === 'responsable' && String(chantier.responsable) !== String(utilisateur._id)) return false;

  return true;
};

// GET /api/travaux/chantier/:chantierId
const getTravauxByChantier = async (req, res) => {
  try {
    const acces = await verifierAccesChantier(req.params.chantierId, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const travaux = await Travail.find({ chantier: req.params.chantierId });

    // Ajouter l'avancement de chaque travail
    const travauxAvecAvancement = await Promise.all(
      travaux.map(async (travail) => {
        const taches = await Tache.find({ travail: travail._id });
        let avancement = 0;
        if (taches.length > 0) {
          const terminees = taches.filter(t => t.statut === 'Terminé').length;
          avancement = Math.round((terminees / taches.length) * 100);
        }
        return { ...travail.toObject(), avancement, nbTaches: taches.length };
      })
    );

    res.json(travauxAvecAvancement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/travaux/:id
const getTravail = async (req, res) => {
  try {
    const travail = await Travail.findById(req.params.id);
    if (!travail) return res.status(404).json({ message: 'Travail non trouvé' });

    const acces = await verifierAccesChantier(travail.chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const taches = await Tache.find({ travail: travail._id });
    let avancement = 0;
    if (taches.length > 0) {
      const terminees = taches.filter(t => t.statut === 'Terminé').length;
      avancement = Math.round((terminees / taches.length) * 100);
    }

    res.json({ ...travail.toObject(), avancement, nbTaches: taches.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/travaux
const creerTravail = async (req, res) => {
  try {
    const { titre, description, chantier } = req.body;

    const acces = await verifierAccesChantier(chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const travail = await Travail.create({
      titre,
      description,
      chantier,
      etat: 'Non commencé'
    });

    res.status(201).json({ message: 'Travail créé avec succès', travail: { ...travail.toObject(), avancement: 0, nbTaches: 0 } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/travaux/:id
const modifierTravail = async (req, res) => {
  try {
    const travail = await Travail.findById(req.params.id);
    if (!travail) return res.status(404).json({ message: 'Travail non trouvé' });

    const acces = await verifierAccesChantier(travail.chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const { titre, description, etat } = req.body;

    if (titre) travail.titre = titre;
    if (description !== undefined) travail.description = description;

    if (etat) {
      // Vérifier si le travail a des tâches
      const taches = await Tache.find({ travail: travail._id });

      if (taches.length > 0) {
        // Travail avec tâches : l'état dépend des tâches, pas modifiable directement
        return res.status(400).json({ message: 'Ce travail contient des tâches. Son état dépend de l\'avancement des tâches.' });
      }

      // Travail sans tâches : modification libre
      travail.etat = etat;
    }

    await travail.save();

    res.json({ message: 'Travail modifié avec succès', travail });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/travaux/:id — Suppression en cascade des tâches
const supprimerTravail = async (req, res) => {
  try {
    const travail = await Travail.findById(req.params.id);
    if (!travail) return res.status(404).json({ message: 'Travail non trouvé' });

    const acces = await verifierAccesChantier(travail.chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    // Supprimer les tâches liées
    await Tache.deleteMany({ travail: travail._id });
    await travail.deleteOne();

    res.json({ message: 'Travail et tâches associées supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTravauxByChantier,
  getTravail,
  creerTravail,
  modifierTravail,
  supprimerTravail
};