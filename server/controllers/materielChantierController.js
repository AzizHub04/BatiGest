const MaterielChantier = require('../models/MaterielChantier');
const Materiel = require('../models/Materiel');

// GET /api/mouvements?materielId=xxx&chantierId=xxx
const getMouvements = async (req, res) => {
  try {
    const { materielId, chantierId } = req.query;

    const filtre = { admin: req.utilisateur._id };
    if (materielId) filtre.materiel = materielId;
    if (chantierId) filtre.chantier = chantierId;

    const mouvements = await MaterielChantier.find(filtre)
      .populate('materiel', 'nom categorie unite')
      .populate('chantier', 'nom')
      .sort({ dateMouvement: -1, createdAt: -1 });

    res.json(mouvements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/mouvements
const creerMouvement = async (req, res) => {
  try {
    const { materielId, chantierId, quantite, typeMouvement, dateMouvement, note } = req.body;

    if (!materielId || !chantierId || !quantite || !typeMouvement) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    const materiel = await Materiel.findById(materielId);
    if (!materiel) return res.status(404).json({ message: 'Matériel non trouvé' });
    if (String(materiel.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Vérifier la disponibilité
    if (typeMouvement === 'Sortie' && quantite > materiel.quantiteStock) {
      return res.status(400).json({
        message: `Stock insuffisant. Disponible : ${materiel.quantiteStock} ${materiel.unite}`
      });
    }

    if (typeMouvement === 'Entrée' && quantite > materiel.quantiteDehors) {
      return res.status(400).json({
        message: `Quantité dehors insuffisante. Dehors : ${materiel.quantiteDehors} ${materiel.unite}`
      });
    }

    // Mettre à jour le stock
    if (typeMouvement === 'Sortie') {
      materiel.quantiteStock -= quantite;
      materiel.quantiteDehors += quantite;
    } else {
      materiel.quantiteStock += quantite;
      materiel.quantiteDehors -= quantite;
    }
    await materiel.save();

    // Créer le mouvement
    const mouvement = await MaterielChantier.create({
      quantite,
      typeMouvement,
      dateMouvement: dateMouvement || new Date().toISOString().split('T')[0],
      note: note || '',
      materiel: materielId,
      chantier: chantierId,
      admin: req.utilisateur._id
    });

    await mouvement.populate('materiel', 'nom categorie unite');
    await mouvement.populate('chantier', 'nom');

    const io = req.app.get('io');
    io.to(`chantier-${chantierId}`).emit('mouvement-updated');

    res.status(201).json({ message: 'Mouvement enregistré avec succès', mouvement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/mouvements/:id — annuler un mouvement (inverse le stock)
const supprimerMouvement = async (req, res) => {
  try {
    const mouvement = await MaterielChantier.findById(req.params.id);
    if (!mouvement) return res.status(404).json({ message: 'Mouvement non trouvé' });
    if (String(mouvement.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Inverser l'effet sur le stock
    const materiel = await Materiel.findById(mouvement.materiel);
    if (materiel) {
      if (mouvement.typeMouvement === 'Sortie') {
        materiel.quantiteStock += mouvement.quantite;
        materiel.quantiteDehors -= mouvement.quantite;
      } else {
        materiel.quantiteStock -= mouvement.quantite;
        materiel.quantiteDehors += mouvement.quantite;
      }
      // Sécurité : pas de valeurs négatives
      materiel.quantiteStock = Math.max(0, materiel.quantiteStock);
      materiel.quantiteDehors = Math.max(0, materiel.quantiteDehors);
      await materiel.save();
    }

    await mouvement.deleteOne();

    const io = req.app.get('io');
    io.to(`chantier-${mouvement.chantier}`).emit('mouvement-updated');

    res.json({ message: 'Mouvement annulé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /api/mouvements/:id
const modifierMouvement = async (req, res) => {
  try {
    const mouvement = await MaterielChantier.findById(req.params.id);
    if (!mouvement) return res.status(404).json({ message: 'Mouvement non trouvé' });
    if (String(mouvement.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { quantite, typeMouvement, chantierId, dateMouvement, note } = req.body;
    const materiel = await Materiel.findById(mouvement.materiel);
    if (!materiel) return res.status(404).json({ message: 'Matériel non trouvé' });

    // 1. Annuler l'ancien mouvement sur le stock
    if (mouvement.typeMouvement === 'Sortie') {
      materiel.quantiteStock += mouvement.quantite;
      materiel.quantiteDehors -= mouvement.quantite;
    } else {
      materiel.quantiteStock -= mouvement.quantite;
      materiel.quantiteDehors += mouvement.quantite;
    }

    // 2. Appliquer le nouveau mouvement
    const newType = typeMouvement || mouvement.typeMouvement;
    const newQte = quantite !== undefined ? Number(quantite) : mouvement.quantite;

    if (newType === 'Sortie' && newQte > materiel.quantiteStock) {
      return res.status(400).json({ message: `Stock insuffisant. Disponible : ${materiel.quantiteStock} ${materiel.unite}` });
    }
    if (newType === 'Entrée' && newQte > materiel.quantiteDehors) {
      return res.status(400).json({ message: `Quantité dehors insuffisante. Dehors : ${materiel.quantiteDehors} ${materiel.unite}` });
    }

    if (newType === 'Sortie') {
      materiel.quantiteStock -= newQte;
      materiel.quantiteDehors += newQte;
    } else {
      materiel.quantiteStock += newQte;
      materiel.quantiteDehors -= newQte;
    }

    materiel.quantiteStock = Math.max(0, materiel.quantiteStock);
    materiel.quantiteDehors = Math.max(0, materiel.quantiteDehors);
    await materiel.save();

    // 3. Mettre à jour le mouvement
    mouvement.quantite = newQte;
    mouvement.typeMouvement = newType;
    if (chantierId) mouvement.chantier = chantierId;
    if (dateMouvement) mouvement.dateMouvement = dateMouvement;
    if (note !== undefined) mouvement.note = note;

    await mouvement.save();
    await mouvement.populate('materiel', 'nom categorie unite');
    await mouvement.populate('chantier', 'nom');

    const io = req.app.get('io');
    io.to(`chantier-${mouvement.chantier}`).emit('mouvement-updated');
    
    res.json({ message: 'Mouvement modifié avec succès', mouvement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// GET /api/mouvements/chantier/:chantierId — matériaux présents sur un chantier
const getMateriauxChantier = async (req, res) => {
  try {
    const mouvements = await MaterielChantier.find({ chantier: req.params.chantierId })
      .populate('materiel', 'nom categorie unite')
      .sort({ dateMouvement: -1 });

    // Calculer la quantité nette par matériel sur ce chantier
    const materielMap = {};
    mouvements.forEach(mv => {
      const mid = String(mv.materiel?._id);
      if (!materielMap[mid]) {
        materielMap[mid] = {
          materiel: mv.materiel,
          quantite: 0,
          dernierMouvement: mv.dateMouvement
        };
      }
      if (mv.typeMouvement === 'Sortie') {
        materielMap[mid].quantite += mv.quantite;
      } else {
        materielMap[mid].quantite -= mv.quantite;
      }
    });

    // Filtrer les matériaux avec quantité > 0 (encore sur le chantier)
    const resultat = Object.values(materielMap).filter(m => m.quantite > 0);

    res.json(resultat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMouvements,
  creerMouvement,
  modifierMouvement,
  supprimerMouvement,
  getMateriauxChantier
};