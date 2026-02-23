const Tache = require('../models/Tache');
const Travail = require('../models/Travail');
const Chantier = require('../models/Chantier');

// Vérifier l'accès via travail → chantier
const verifierAccesTravail = async (travailId, utilisateur) => {
  const travail = await Travail.findById(travailId);
  if (!travail) return false;

  const chantier = await Chantier.findById(travail.chantier);
  if (!chantier) return false;

  if (utilisateur.role === 'admin' && String(chantier.admin) !== String(utilisateur._id)) return false;
  if (utilisateur.role === 'responsable' && String(chantier.responsable) !== String(utilisateur._id)) return false;

  return true;
};

// Mettre à jour l'état du travail selon les tâches
const mettreAJourEtatTravail = async (travailId) => {
  const taches = await Tache.find({ travail: travailId });

  if (taches.length === 0) return;

  const travail = await Travail.findById(travailId);
  if (!travail) return;

  const toutesTerminees = taches.every(t => t.statut === 'Terminé');
  const auMoinsUneEnCours = taches.some(t => t.statut === 'En cours' || t.statut === 'Terminé');

  if (toutesTerminees) {
    travail.etat = 'Terminé';
  } else if (auMoinsUneEnCours) {
    travail.etat = 'En cours';
  } else {
    travail.etat = 'Non commencé';
  }

  await travail.save();
};

// GET /api/taches/travail/:travailId
const getTachesByTravail = async (req, res) => {
  try {
    const acces = await verifierAccesTravail(req.params.travailId, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const taches = await Tache.find({ travail: req.params.travailId });
    res.json(taches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/taches
const creerTache = async (req, res) => {
  try {
    const { titre, description, priorite, travail } = req.body;

    const acces = await verifierAccesTravail(travail, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const tache = await Tache.create({
      titre,
      description,
      priorite: priorite || 'Moyenne',
      statut: 'Non commencé',
      travail
    });

    // Mettre à jour l'état du travail
    await mettreAJourEtatTravail(travail);

    res.status(201).json({ message: 'Tâche créée avec succès', tache });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/taches/:id
const modifierTache = async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id);
    if (!tache) return res.status(404).json({ message: 'Tâche non trouvée' });

    const acces = await verifierAccesTravail(tache.travail, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const { titre, description, statut, priorite } = req.body;

    if (titre) tache.titre = titre;
    if (description !== undefined) tache.description = description;
    if (statut) tache.statut = statut;
    if (priorite) tache.priorite = priorite;

    await tache.save();

    // Mettre à jour l'état du travail
    await mettreAJourEtatTravail(tache.travail);

    res.json({ message: 'Tâche modifiée avec succès', tache });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/taches/:id/statut — Changer le statut rapidement
const changerStatut = async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id);
    if (!tache) return res.status(404).json({ message: 'Tâche non trouvée' });

    const acces = await verifierAccesTravail(tache.travail, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const { statut } = req.body;
    const statutsValides = ['Non commencé', 'En cours', 'Terminé'];

    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    tache.statut = statut;
    await tache.save();

    // Mettre à jour l'état du travail
    await mettreAJourEtatTravail(tache.travail);

    res.json({ message: `Statut changé à "${statut}"`, tache });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/taches/:id
const supprimerTache = async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id);
    if (!tache) return res.status(404).json({ message: 'Tâche non trouvée' });

    const acces = await verifierAccesTravail(tache.travail, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const travailId = tache.travail;
    await tache.deleteOne();

    // Mettre à jour l'état du travail
    await mettreAJourEtatTravail(travailId);

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTachesByTravail,
  creerTache,
  modifierTache,
  changerStatut,
  supprimerTache
};