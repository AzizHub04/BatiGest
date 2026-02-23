const NoteChantier = require('../models/NoteChantier');
const Chantier = require('../models/Chantier');

const verifierAccesChantier = async (chantierId, utilisateur) => {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return false;
  if (utilisateur.role === 'admin' && String(chantier.admin) !== String(utilisateur._id)) return false;
  if (utilisateur.role === 'responsable' && String(chantier.responsable) !== String(utilisateur._id)) return false;
  return true;
};

// GET /api/notes/chantier/:chantierId
const getNotesByChantier = async (req, res) => {
  try {
    const acces = await verifierAccesChantier(req.params.chantierId, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const notes = await NoteChantier.find({ chantier: req.params.chantierId })
      .populate('auteur', 'nom prenom role')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/notes
const creerNote = async (req, res) => {
  try {
    const { contenu, chantier } = req.body;

    const acces = await verifierAccesChantier(chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const note = await NoteChantier.create({
      contenu,
      chantier,
      auteur: req.utilisateur._id
    });

    await note.populate('auteur', 'nom prenom role');

    res.status(201).json({ message: 'Note ajoutée avec succès', note });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/notes/:id
const modifierNote = async (req, res) => {
  try {
    const note = await NoteChantier.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note non trouvée' });

    // Seul l'auteur peut modifier sa note
    if (String(note.auteur) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres notes' });
    }

    const { contenu } = req.body;
    if (contenu) note.contenu = contenu;

    await note.save();
    await note.populate('auteur', 'nom prenom role');

    res.json({ message: 'Note modifiée avec succès', note });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/notes/:id
const supprimerNote = async (req, res) => {
  try {
    const note = await NoteChantier.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note non trouvée' });

    // L'auteur ou l'admin peut supprimer
    if (String(note.auteur) !== String(req.utilisateur._id) && req.utilisateur.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Si admin, vérifier qu'il a accès au chantier
    if (req.utilisateur.role === 'admin') {
      const acces = await verifierAccesChantier(note.chantier, req.utilisateur);
      if (!acces) return res.status(403).json({ message: 'Accès refusé' });
    }

    await note.deleteOne();

    res.json({ message: 'Note supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotesByChantier,
  creerNote,
  modifierNote,
  supprimerNote
};