const CoutPaiementChantier = require('../models/CoutPaiementChantier');
const Chantier = require('../models/Chantier');

const verifierAccesChantier = async (chantierId, utilisateur) => {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return false;
  if (utilisateur.role === 'admin' && String(chantier.admin) !== String(utilisateur._id)) return false;
  if (utilisateur.role === 'responsable' && String(chantier.responsable) !== String(utilisateur._id)) return false;
  return true;
};

// GET /api/couts/chantier/:chantierId
const getCoutsByChantier = async (req, res) => {
  try {
    const acces = await verifierAccesChantier(req.params.chantierId, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const couts = await CoutPaiementChantier.find({ chantier: req.params.chantierId })
      .sort({ createdAt: -1 });

    // Calculer les totaux
    const totalDepense = couts.filter(c => c.type === 'Dépense').reduce((sum, c) => sum + c.montant, 0);
    const totalRecu = couts.filter(c => c.type === 'Règlement').reduce((sum, c) => sum + c.montant, 0);
    const chantier = await Chantier.findById(req.params.chantierId);

    res.json({
      couts,
      totalDepense,
      totalRecu,
      budget: chantier.budget
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/couts
const creerCout = async (req, res) => {
  try {
    const { type, montant, description, modePaiement, chantier } = req.body;

    const acces = await verifierAccesChantier(chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const cout = await CoutPaiementChantier.create({
      type,
      montant,
      description,
      modePaiement: modePaiement || 'Espèces',
      chantier
    });

    res.status(201).json({ message: 'Opération enregistrée avec succès', cout });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/couts/:id
const modifierCout = async (req, res) => {
  try {
    const cout = await CoutPaiementChantier.findById(req.params.id);
    if (!cout) return res.status(404).json({ message: 'Opération non trouvée' });

    const acces = await verifierAccesChantier(cout.chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const { type, montant, description, modePaiement } = req.body;

    if (type) cout.type = type;
    if (montant !== undefined) cout.montant = montant;
    if (description !== undefined) cout.description = description;
    if (modePaiement) cout.modePaiement = modePaiement;

    await cout.save();

    res.json({ message: 'Opération modifiée avec succès', cout });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/couts/:id
const supprimerCout = async (req, res) => {
  try {
    const cout = await CoutPaiementChantier.findById(req.params.id);
    if (!cout) return res.status(404).json({ message: 'Opération non trouvée' });

    const acces = await verifierAccesChantier(cout.chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    await cout.deleteOne();

    res.json({ message: 'Opération supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCoutsByChantier,
  creerCout,
  modifierCout,
  supprimerCout
};