const Utilisateur = require('../models/Utilisateur');

// GET /api/responsables — Lister tous les responsables
const getResponsables = async (req, res) => {
  try {
    const responsables = await Utilisateur.find({ 
      role: 'responsable', 
      admin: req.utilisateur._id 
    }).select('-motDePasse');
    res.json(responsables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/responsables/:id — Récupérer un responsable
const getResponsable = async (req, res) => {
  try {
    const responsable = await Utilisateur.findById(req.params.id).select('-motDePasse');

    if (!responsable || responsable.role !== 'responsable' || String(responsable.admin) !== String(req.utilisateur._id)) {
      return res.status(404).json({ message: 'Responsable non trouvé' });
    }

    res.json(responsable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/responsables — Créer un responsable
const creerResponsable = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, tarifJournalier } = req.body;

    const responsable = await Utilisateur.create({
      nom,
      prenom,
      email,
      motDePasse,
      role: 'responsable',
      tarifJournalier: tarifJournalier || null,
      admin: req.utilisateur._id
    });

    // Émettre un événement Socket.io
    const io = req.app.get('io');
    io.emit('responsable-added', { id: responsable._id, nom, prenom, email });

    res.status(201).json({
      message: 'Responsable créé avec succès',
      responsable: {
        id: responsable._id,
        nom: responsable.nom,
        prenom: responsable.prenom,
        email: responsable.email,
        role: responsable.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/responsables/:id — Modifier un responsable
const modifierResponsable = async (req, res) => {
  try {
    const responsable = await Utilisateur.findById(req.params.id);

    if (!responsable || responsable.role !== 'responsable' || String(responsable.admin) !== String(req.utilisateur._id)) {
      return res.status(404).json({ message: 'Responsable non trouvé' });
    }

    const { nom, prenom, email, motDePasse, tarifJournalier } = req.body;

    // Vérifier si le nouvel email existe déjà chez un autre utilisateur
    if (email && email !== responsable.email) {
      const emailExiste = await Utilisateur.findOne({ email });
      if (emailExiste) {
        return res.status(400).json({ message: 'Cet email existe déjà' });
      }
    }

    if (nom) responsable.nom = nom;
    if (prenom) responsable.prenom = prenom;
    if (email) responsable.email = email;
    if (motDePasse) responsable.motDePasse = motDePasse; // sera haché par pre('save')
    if (tarifJournalier !== undefined) responsable.tarifJournalier = tarifJournalier;

    await responsable.save();

    const io = req.app.get('io');
    io.emit('responsable-updated', { id: responsable._id });

    res.json({
      message: 'Responsable modifié avec succès',
      responsable: {
        id: responsable._id,
        nom: responsable.nom,
        prenom: responsable.prenom,
        email: responsable.email,
        role: responsable.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/responsables/:id — Supprimer un responsable
const supprimerResponsable = async (req, res) => {
  try {
    const responsable = await Utilisateur.findById(req.params.id);

    if (!responsable || responsable.role !== 'responsable' || String(responsable.admin) !== String(req.utilisateur._id)) {
      return res.status(404).json({ message: 'Responsable non trouvé' });
    }

    await responsable.deleteOne();

    const io = req.app.get('io');
    io.emit('responsable-deleted', { id: req.params.id });

    res.json({ message: 'Responsable supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getResponsables,
  getResponsable,
  creerResponsable,
  modifierResponsable,
  supprimerResponsable
};