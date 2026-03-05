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
// Retourne le résumé automatique par SEMAINE (lundi→dimanche)
const getAutoResume = async (req, res) => {
  try {
    const { ouvrierId, responsableId } = req.query;
    if (!ouvrierId && !responsableId) {
      return res.status(400).json({ message: 'Ouvrier ou responsable requis' });
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

    // Tous les pointages travaillés (chantier non null)
    const filtrePointage = { admin: req.utilisateur._id, chantier: { $ne: null } };
    if (ouvrierId) filtrePointage.ouvrier = ouvrierId;
    if (responsableId) filtrePointage.responsable = responsableId;
    const pointages = await Pointage.find(filtrePointage).sort({ date: 1 });

    // Grouper par semaine (lundi → dimanche), clé = lundiStr
    const parSemaine = {};
    pointages.forEach(p => {
      const d = new Date(p.date + 'T12:00:00');
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const lundi = new Date(d);
      lundi.setDate(d.getDate() + diff);
      const lundiStr = lundi.toISOString().split('T')[0];
      if (!parSemaine[lundiStr]) parSemaine[lundiStr] = { jours: 0 };
      parSemaine[lundiStr].jours += p.demiJournee ? 0.5 : 1;
    });

    // Paiements existants indexés par dateDebut (= lundiStr)
    const filtrePaiement = { admin: req.utilisateur._id };
    if (ouvrierId) filtrePaiement.ouvrier = ouvrierId;
    if (responsableId) filtrePaiement.responsable = responsableId;
    const paiements = await PaiementOuvrier.find(filtrePaiement);
    const paiementMap = {};
    paiements.forEach(p => { paiementMap[p.dateDebut] = p; });

    const formatD = (str) => {
      const date = new Date(str + 'T12:00:00');
      return date.getDate() + ' ' + date.toLocaleDateString('fr-FR', { month: 'short' });
    };

    const semainesArr = Object.keys(parSemaine).sort().reverse();
    const resume = semainesArr.map(lundiStr => {
      const data = parSemaine[lundiStr];
      const montantDu = data.jours * tarif;
      const lundi = new Date(lundiStr + 'T12:00:00');
      const dimanche = new Date(lundi);
      dimanche.setDate(lundi.getDate() + 6);
      const dimancheStr = dimanche.toISOString().split('T')[0];
      const paiement = paiementMap[lundiStr];
      const montantPaye = paiement?.montantPaye || 0;
      const montantRestant = Math.max(0, montantDu - montantPaye);
      let statut = 'Non payé';
      if (montantRestant <= 0 && montantDu > 0) statut = 'Payé';
      else if (montantPaye > 0) statut = 'Partiel';
      return {
        lundiStr, dimancheStr,
        label: formatD(lundiStr) + ' - ' + formatD(dimancheStr),
        joursTravailes: data.jours, tarif,
        montantDu, montantPaye, montantRestant, statut,
        paiementId: paiement?._id || null,
        datePaiement: paiement?.datePaiement || null
      };
    });

    const totalDu = resume.reduce((s, r) => s + r.montantDu, 0);
    const totalPaye = resume.reduce((s, r) => s + r.montantPaye, 0);
    res.json({ resume, totalDu, totalPaye, totalRestant: Math.max(0, totalDu - totalPaye) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/paiements-ouvriers/regler — Régler une semaine donnée (lundiStr)
const reglerPaiement = async (req, res) => {
  try {
    const { ouvrierId, responsableId, lundiStr, montant } = req.body;
    if (!montant || Number(montant) <= 0) {
      return res.status(400).json({ message: 'Montant invalide' });
    }
    if (!lundiStr) {
      return res.status(400).json({ message: 'Semaine requise (lundiStr)' });
    }

    const lundi = new Date(lundiStr + 'T12:00:00');
    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);
    const dimancheStr = dimanche.toISOString().split('T')[0];

    // Chercher paiement existant pour cette semaine (dateDebut = lundiStr)
    const filtre = { admin: req.utilisateur._id, dateDebut: lundiStr };
    if (ouvrierId) filtre.ouvrier = ouvrierId;
    if (responsableId) filtre.responsable = responsableId;

    let paiement = await PaiementOuvrier.findOne(filtre);
    const montantNum = Number(montant);

    if (paiement) {
      paiement.montantPaye = Math.min(paiement.montantPaye + montantNum, paiement.montantTotal);
      paiement.montantRestant = Math.max(0, paiement.montantTotal - paiement.montantPaye);
      paiement.statutPaiement = paiement.montantRestant <= 0 ? 'Payé' : 'Partiel';
      paiement.datePaiement = new Date();
      await paiement.save();
    } else {
      // Calculer montant total depuis les pointages de la semaine
      const filtreP = {
        admin: req.utilisateur._id,
        chantier: { $ne: null },
        date: { $gte: lundiStr, $lte: dimancheStr }
      };
      if (ouvrierId) filtreP.ouvrier = ouvrierId;
      if (responsableId) filtreP.responsable = responsableId;
      const pts = await Pointage.find(filtreP);

      let tarif = 0;
      if (ouvrierId) { const o = await Ouvrier.findById(ouvrierId); tarif = o?.tarifJournalier || 0; }
      if (responsableId) { const r = await Utilisateur.findById(responsableId); tarif = r?.tarifJournalier || 0; }

      let totalJours = 0;
      pts.forEach(p => { totalJours += p.demiJournee ? 0.5 : 1; });
      const montantTotal = totalJours * tarif;

      paiement = await PaiementOuvrier.create({
        dateDebut: lundiStr, dateFin: dimancheStr,
        montantTotal,
        montantPaye: Math.min(montantNum, montantTotal),
        montantRestant: Math.max(0, montantTotal - montantNum),
        statutPaiement: montantNum >= montantTotal ? 'Payé' : 'Partiel',
        datePaiement: new Date(),
        ouvrier: ouvrierId || null, responsable: responsableId || null,
        pointages: pts.map(p => p._id), admin: req.utilisateur._id
      });
    }

    await paiement.populate('ouvrier', 'nom prenom tarifJournalier');
    await paiement.populate('responsable', 'nom prenom tarifJournalier');
    res.json({ message: 'Règlement enregistré', paiement });
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