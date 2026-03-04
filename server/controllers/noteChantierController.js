const NoteChantier = require('../models/NoteChantier');
const Chantier = require('../models/Chantier');
const Notification = require('../models/Notification');
const Utilisateur = require('../models/Utilisateur');
const { envoyerEmailNotification } = require('../config/email');

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
    const { titre, contenu, chantier } = req.body;

    const acces = await verifierAccesChantier(chantier, req.utilisateur);
    if (!acces) return res.status(403).json({ message: 'Accès refusé' });

    const note = await NoteChantier.create({
      titre,
      contenu,
      chantier,
      auteur: req.utilisateur._id
    });

    await note.populate('auteur', 'nom prenom role');

    const io = req.app.get('io');
    io.to(`chantier-${chantier}`).emit('note-added');

    const auteur = `${req.utilisateur.prenom} ${req.utilisateur.nom}`;
    await creerNotificationNote(
      req, chantier,
      'Nouvelle note ajoutée',
      `${auteur} a ajouté une note : "${titre}"`,
      note._id
    );

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

    const { titre, contenu } = req.body;
    if (titre) note.titre = titre;
    if (contenu) note.contenu = contenu;

    await note.save();
    await note.populate('auteur', 'nom prenom role');

    const io = req.app.get('io');
    io.to(`chantier-${note.chantier}`).emit('note-updated');

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

    const io = req.app.get('io');
    io.to(`chantier-${note.chantier}`).emit('note-deleted');

    res.json({ message: 'Note supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const creerNotificationNote = async (req, chantierId, titre, messageText, noteId = null) => {
  const chantier = await Chantier.findById(chantierId);
  if (!chantier) return;

  const destinataires = [];

  // Si l'auteur est l'admin → notifier le responsable
  if (req.utilisateur.role === 'admin' && chantier.responsable) {
    destinataires.push(chantier.responsable);
  }

  // Si l'auteur est le responsable → notifier l'admin
  if (req.utilisateur.role === 'responsable' && chantier.admin) {
    destinataires.push(chantier.admin);
  }

  const io = req.app.get('io');

  for (const destId of destinataires) {
    // Créer la notification en base
    const notification = await Notification.create({
      titre,
      message: messageText,
      utilisateur: destId,
      chantier: chantierId,
      note: noteId
    });

    console.log('Envoi notif à room:', String(destId));
    console.log('Rooms actives:', io.sockets.adapter.rooms);
    
    // Envoyer en temps réel via Socket.io
    io.to(String(destId)).emit('nouvelle-notification', {
      _id: notification._id,
      titre: notification.titre,
      message: notification.message,
      chantier: { _id: chantierId, nom: chantier.nom },
      note: noteId ? { _id: noteId } : null,
      estLue: false,
      createdAt: notification.createdAt
    });

    // Envoyer par email
    try {
      const destinataire = await Utilisateur.findById(destId);
      if (destinataire?.email) {
        await envoyerEmailNotification(destinataire.email, titre, messageText, chantier.nom);
      }
    } catch (emailErr) {
      console.error('Erreur envoi email notification:', emailErr.message);
    }
  }
};

module.exports = {
  getNotesByChantier,
  creerNote,
  modifierNote,
  supprimerNote
};