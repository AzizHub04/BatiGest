const PaiementOuvrier = require('../models/PaiementOuvrier');
const Pointage = require('../models/Pointage');
const Ouvrier = require('../models/Ouvrier');
const Utilisateur = require('../models/Utilisateur');

// GET /api/paiements-ouvriers?ouvrierId=xxx ou responsableId=xxx
const getPaiements = async (req, res) => {
  try {
    const { ouvrierId, responsableId } = req.query;

    const filtre = { admin: req.utilisateur._id };
    if (ouvrierId) filtre.ouvrier = ouvrierId;
    if (responsableId) filtre.responsable = responsableId;

    const paiements = await PaiementOuvrier.find(filtre)
      .populate('ouvrier', 'nom prenom tarifJournalier')
      .populate('responsable', 'nom prenom tarifJournalier')
      .sort({ dateDebut: -1 });

    res.json(paiements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/paiements-ouvriers/generer — Générer un paiement à partir des pointages
const genererPaiement = async (req, res) => {
  try {
    const { ouvrierId, responsableId, dateDebut, dateFin } = req.body;

    if (!ouvrierId && !responsableId) {
      return res.status(400).json({ message: 'Ouvrier ou responsable requis' });
    }
    if (!dateDebut || !dateFin) {
      return res.status(400).json({ message: 'Les dates de début et fin sont obligatoires' });
    }

    // Récupérer les pointages de la période (chantier non null = jour travaillé)
    const filtrePointage = {
      admin: req.utilisateur._id,
      chantier: { $ne: null },
      date: { $gte: dateDebut, $lte: dateFin }
    };

    if (ouvrierId) filtrePointage.ouvrier = ouvrierId;
    if (responsableId) filtrePointage.responsable = responsableId;

    const pointages = await Pointage.find(filtrePointage);

    if (pointages.length === 0) {
      return res.status(400).json({ message: 'Aucun pointage trouvé pour cette période' });
    }

    // Récupérer le tarif journalier
    let tarif = 0;
    if (ouvrierId) {
      const ouvrier = await Ouvrier.findById(ouvrierId);
      tarif = ouvrier?.tarifJournalier || 0;
    }
    if (responsableId) {
      const resp = await Utilisateur.findById(responsableId);
      tarif = resp?.tarifJournalier || 0;
    }

    // Calcul avec demi-journées
    let totalJours = 0;
    pointages.forEach(p => {
      totalJours += p.demiJournee ? 0.5 : 1;
    });
    const montantTotal = totalJours * tarif;

    const paiement = await PaiementOuvrier.create({
      dateDebut,
      dateFin,
      montantTotal,
      montantPaye: 0,
      montantRestant: montantTotal,
      statutPaiement: 'Non payé',
      ouvrier: ouvrierId || null,
      responsable: responsableId || null,
      pointages: pointages.map(p => p._id),
      admin: req.utilisateur._id
    });

    await paiement.populate('ouvrier', 'nom prenom tarifJournalier');
    await paiement.populate('responsable', 'nom prenom tarifJournalier');

    res.status(201).json({
      message: `Paiement généré : ${totalJours} jours × ${tarif} DT = ${montantTotal} DT`,
      paiement
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/paiements-ouvriers/:id/payer — Enregistrer un paiement (partiel ou total)
const payerPaiement = async (req, res) => {
  try {
    const paiement = await PaiementOuvrier.findById(req.params.id);
    if (!paiement) return res.status(404).json({ message: 'Paiement non trouvé' });
    if (String(paiement.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { montant } = req.body;
    if (!montant || montant <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    if (montant > paiement.montantRestant) {
      return res.status(400).json({ message: `Le montant ne peut pas dépasser ${paiement.montantRestant} DT` });
    }

    paiement.montantPaye += montant;
    paiement.montantRestant = paiement.montantTotal - paiement.montantPaye;
    paiement.datePaiement = new Date();

    if (paiement.montantRestant === 0) {
      paiement.statutPaiement = 'Payé';
    } else {
      paiement.statutPaiement = 'Partiel';
    }

    await paiement.save();
    await paiement.populate('ouvrier', 'nom prenom tarifJournalier');
    await paiement.populate('responsable', 'nom prenom tarifJournalier');

    res.json({ message: 'Paiement enregistré', paiement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/paiements-ouvriers/:id
const supprimerPaiement = async (req, res) => {
  try {
    const paiement = await PaiementOuvrier.findById(req.params.id);
    if (!paiement) return res.status(404).json({ message: 'Paiement non trouvé' });
    if (String(paiement.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await paiement.deleteOne();
    res.json({ message: 'Paiement supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/paiements-ouvriers/:id
const modifierPaiement = async (req, res) => {
  try {
    const paiement = await PaiementOuvrier.findById(req.params.id);
    if (!paiement) return res.status(404).json({ message: 'Paiement non trouvé' });
    if (String(paiement.admin) !== String(req.utilisateur._id)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { montantPaye, dateDebut, dateFin } = req.body;

    if (dateDebut) paiement.dateDebut = dateDebut;
    if (dateFin) paiement.dateFin = dateFin;

    if (montantPaye !== undefined) {
      paiement.montantPaye = montantPaye;
      paiement.montantRestant = paiement.montantTotal - montantPaye;

      if (paiement.montantRestant <= 0) {
        paiement.montantRestant = 0;
        paiement.montantPaye = paiement.montantTotal;
        paiement.statutPaiement = 'Payé';
      } else if (paiement.montantPaye > 0) {
        paiement.statutPaiement = 'Partiel';
      } else {
        paiement.statutPaiement = 'Non payé';
      }

      paiement.datePaiement = montantPaye > 0 ? new Date() : null;
    }

    await paiement.save();
    await paiement.populate('ouvrier', 'nom prenom tarifJournalier');
    await paiement.populate('responsable', 'nom prenom tarifJournalier');

    res.json({ message: 'Paiement modifié', paiement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// GET /api/paiements-ouvriers/auto?ouvrierId=xxx ou responsableId=xxx
const getAutoResume = async (req, res) => {
  try {
    const { ouvrierId, responsableId } = req.query;
    if (!ouvrierId && !responsableId) {
      return res.status(400).json({ message: 'Ouvrier ou responsable requis' });
    }

    // Récupérer le tarif journalier
    let tarif = 0;
    if (ouvrierId) {
      const ouvrier = await Ouvrier.findById(ouvrierId);
      tarif = ouvrier?.tarifJournalier || 0;
    }
    if (responsableId) {
      const resp = await Utilisateur.findById(responsableId);
      tarif = resp?.tarifJournalier || 0;
    }

    // Tous les pointages travaillés (chantier non null)
    const filtrePointage = {
      admin: req.utilisateur._id,
      chantier: { $ne: null }
    };
    if (ouvrierId) filtrePointage.ouvrier = ouvrierId;
    if (responsableId) filtrePointage.responsable = responsableId;

    const pointages = await Pointage.find(filtrePointage).sort({ date: 1 });

    // Grouper par mois
    const parMois = {};
    pointages.forEach(p => {
      const mois = p.date.substring(0, 7);
      if (!parMois[mois]) parMois[mois] = 0;
      parMois[mois] += p.demiJournee ? 0.5 : 1;
    });

    // Tous les paiements existants pour cette personne
    const filtrePaiement = { admin: req.utilisateur._id };
    if (ouvrierId) filtrePaiement.ouvrier = ouvrierId;
    if (responsableId) filtrePaiement.responsable = responsableId;

    const paiements = await PaiementOuvrier.find(filtrePaiement);

    // Indexer les paiements par mois (dateDebut commence par mois YYYY-MM)
    const paiementParMois = {};
    paiements.forEach(p => {
      if (p.dateDebut && p.dateDebut.length >= 7) {
        paiementParMois[p.dateDebut.substring(0, 7)] = p;
      }
    });

    // Construire le résultat trié par mois décroissant
    const moisTries = Object.keys(parMois).sort().reverse();
    const result = moisTries.map(mois => ({
      mois,
      jours: parMois[mois],
      montantDu: parMois[mois] * tarif,
      tarif,
      paiement: paiementParMois[mois] || null
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/paiements-ouvriers/regler — Régler un mois donné
const reglerPaiement = async (req, res) => {
  try {
    const { ouvrierId, responsableId, mois, montant } = req.body;

    if (!ouvrierId && !responsableId) {
      return res.status(400).json({ message: 'Ouvrier ou responsable requis' });
    }
    if (!mois) {
      return res.status(400).json({ message: 'Le mois est obligatoire (format: YYYY-MM)' });
    }
    if (!montant || Number(montant) <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    // Tarif journalier
    let tarif = 0;
    if (ouvrierId) {
      const ouvrier = await Ouvrier.findById(ouvrierId);
      tarif = ouvrier?.tarifJournalier || 0;
    }
    if (responsableId) {
      const resp = await Utilisateur.findById(responsableId);
      tarif = resp?.tarifJournalier || 0;
    }

    // Pointages travaillés du mois
    const filtrePointage = {
      admin: req.utilisateur._id,
      chantier: { $ne: null },
      date: { $regex: `^${mois}` }
    };
    if (ouvrierId) filtrePointage.ouvrier = ouvrierId;
    if (responsableId) filtrePointage.responsable = responsableId;

    const pointages = await Pointage.find(filtrePointage);

    let totalJours = 0;
    pointages.forEach(p => { totalJours += p.demiJournee ? 0.5 : 1; });
    const montantTotal = totalJours * tarif;

    // Bornes du mois
    const [annee, moisNum] = mois.split('-').map(Number);
    const lastDay = new Date(annee, moisNum, 0).getDate();
    const dateDebut = `${mois}-01`;
    const dateFin = `${mois}-${String(lastDay).padStart(2, '0')}`;

    // Paiement existant pour ce mois
    const filtrePaiement = {
      admin: req.utilisateur._id,
      dateDebut: { $regex: `^${mois}` }
    };
    if (ouvrierId) filtrePaiement.ouvrier = ouvrierId;
    if (responsableId) filtrePaiement.responsable = responsableId;

    const montantNum = Number(montant);
    let paiement = await PaiementOuvrier.findOne(filtrePaiement);

    if (!paiement) {
      const montantPaye = Math.min(montantNum, montantTotal);
      const montantRestant = Math.max(0, montantTotal - montantPaye);
      paiement = await PaiementOuvrier.create({
        dateDebut,
        dateFin,
        montantTotal,
        montantPaye,
        montantRestant,
        statutPaiement: montantRestant === 0 ? 'Payé' : (montantPaye > 0 ? 'Partiel' : 'Non payé'),
        datePaiement: new Date(),
        ouvrier: ouvrierId || null,
        responsable: responsableId || null,
        pointages: pointages.map(p => p._id),
        admin: req.utilisateur._id
      });
    } else {
      paiement.montantTotal = montantTotal;
      paiement.montantPaye = Math.min(paiement.montantPaye + montantNum, montantTotal);
      paiement.montantRestant = Math.max(0, montantTotal - paiement.montantPaye);
      paiement.datePaiement = new Date();
      paiement.pointages = pointages.map(p => p._id);
      if (paiement.montantRestant === 0) {
        paiement.statutPaiement = 'Payé';
      } else if (paiement.montantPaye > 0) {
        paiement.statutPaiement = 'Partiel';
      } else {
        paiement.statutPaiement = 'Non payé';
      }
      await paiement.save();
    }

    await paiement.populate('ouvrier', 'nom prenom tarifJournalier');
    await paiement.populate('responsable', 'nom prenom tarifJournalier');

    res.json({ message: 'Paiement enregistré', paiement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getPaiements,
  genererPaiement,
  payerPaiement,
  modifierPaiement,
  supprimerPaiement,
  getAutoResume,
  reglerPaiement
};