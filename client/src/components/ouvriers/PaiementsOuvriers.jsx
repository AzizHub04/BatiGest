import { useState, useMemo } from "react";
import { useGetOuvriersQuery } from "../../services/ouvrierApiSlice";
import { useGetResponsablesQuery } from "../../services/responsableApiSlice";
import {
  useGetAutoResumeQuery,
  useGetPaiementsQuery,
  useGenererPaiementMutation,
  usePayerPaiementMutation,
  useModifierPaiementMutation,
  useSupprimerPaiementMutation,
} from "../../services/paiementOuvrierApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";

const PaiementsOuvriers = () => {
  const now = new Date();
  const [moisFiltre, setMoisFiltre] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const { data: ouvriers = [] } = useGetOuvriersQuery();
  const { data: responsables = [] } = useGetResponsablesQuery();

  const [selectedPersonne, setSelectedPersonne] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [genererModal, setGenererModal] = useState(false);
  const [genererForm, setGenererForm] = useState({ dateDebut: "", dateFin: "" });
  const [payerModal, setPayerModal] = useState(null);
  const [payerMontant, setPayerMontant] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ montantPaye: "", dateDebut: "", dateFin: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);
  const [erreur, setErreur] = useState("");

  const queryParams = selectedPersonne
    ? selectedType === "ouvrier"
      ? { ouvrierId: selectedPersonne }
      : { responsableId: selectedPersonne }
    : null;

  const { data: paiements = [] } = useGetPaiementsQuery(queryParams, {
    skip: !selectedPersonne,
  });
  const { data: resume = [] } = useGetAutoResumeQuery(queryParams, {
    skip: !selectedPersonne,
  });

  const [genererPaiement] = useGenererPaiementMutation();
  const [payerPaiement] = usePayerPaiementMutation();
  const [modifierPaiement] = useModifierPaiementMutation();
  const [supprimerPaiement] = useSupprimerPaiementMutation();

  // Calcul des semaines du mois filtré (pour les présets dans le modal Générer)
  const semainsDuMois = useMemo(() => {
    const [annee, m] = moisFiltre.split("-").map(Number);
    const nbJours = new Date(annee, m, 0).getDate();
    const result = [];
    let debut = 1;
    for (let i = 1; i <= nbJours; i++) {
      if (new Date(annee, m - 1, i).getDay() === 6 || i === nbJours) {
        const d = String(debut).padStart(2, "0");
        const f = String(i).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        result.push({
          debut: `${annee}-${mm}-${d}`,
          fin: `${annee}-${mm}-${f}`,
          label: `${d}/${mm} → ${f}/${mm}`,
        });
        debut = i + 1;
      }
    }
    return result;
  }, [moisFiltre]);

  // Données filtrées par mois
  const resumeMois = resume.find((r) => r.mois === moisFiltre);
  const paiementsDuMois = paiements.filter(
    (p) => p.dateDebut?.startsWith(moisFiltre),
  );

  const totalDuMois = resumeMois?.montantDu || 0;
  const totalPayeMois = paiementsDuMois.reduce(
    (sum, p) => sum + p.montantPaye,
    0,
  );
  const totalRestantMois = Math.max(0, totalDuMois - totalPayeMois);

  // Formatage date — gère string "YYYY-MM-DD" et objets Date
  const formatDate = (d) => {
    if (!d) return "—";
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)) {
      const [y, mo, dd] = d.substring(0, 10).split("-").map(Number);
      return `${String(dd).padStart(2, "0")}/${String(mo).padStart(2, "0")}/${y}`;
    }
    return new Date(d).toLocaleDateString("fr-FR");
  };

  const statutStyle = (s) => {
    switch (s) {
      case "Payé":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "Partiel":
        return { bg: "#fef3c7", color: "#d97706" };
      default:
        return { bg: "#fee2e2", color: "#dc2626" };
    }
  };

  const nomMois = (mois) => {
    const [annee, m] = mois.split("-").map(Number);
    return new Date(annee, m - 1, 15).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  const personneNom = () => {
    if (!selectedPersonne) return "";
    if (selectedType === "ouvrier") {
      const o = ouvriers.find((o) => o._id === selectedPersonne);
      return o ? `${o.prenom} ${o.nom}` : "";
    }
    const r = responsables.find((r) => r._id === selectedPersonne);
    return r ? `${r.prenom} ${r.nom}` : "";
  };

  const prevMois = () => {
    const [a, m] = moisFiltre.split("-").map(Number);
    setMoisFiltre(
      m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, "0")}`,
    );
  };
  const nextMois = () => {
    const [a, m] = moisFiltre.split("-").map(Number);
    setMoisFiltre(
      m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`,
    );
  };

  const handleGenerer = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      const data = { ...genererForm };
      if (selectedType === "ouvrier") data.ouvrierId = selectedPersonne;
      else data.responsableId = selectedPersonne;
      await genererPaiement(data).unwrap();
      setGenererModal(false);
      setSucces({ type: "success", message: "Paiement généré avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handlePayer = async (e) => {
    e.preventDefault();
    try {
      await payerPaiement({ id: payerModal, montant: Number(payerMontant) }).unwrap();
      setPayerModal(null);
      setPayerMontant("");
      setSucces({ type: "success", message: "Paiement enregistré" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleModifier = async (e) => {
    e.preventDefault();
    try {
      await modifierPaiement({
        id: editModal,
        montantPaye: Number(editForm.montantPaye),
        dateDebut: editForm.dateDebut,
        dateFin: editForm.dateFin,
      }).unwrap();
      setEditModal(null);
      setSucces({ type: "warning", message: "Paiement modifié" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleSupprimer = async (id) => {
    try {
      await supprimerPaiement(id).unwrap();
      setDeleteConfirm(null);
      setSucces({ type: "delete", message: "Paiement supprimé" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (p) => {
    setEditForm({
      montantPaye: p.montantPaye,
      dateDebut: p.dateDebut || "",
      dateFin: p.dateFin || "",
    });
    setEditModal(p._id);
  };

  const openGenerer = () => {
    // Pré-remplir avec la 1ère semaine du mois filtré
    const s = semainsDuMois[0];
    setGenererForm(s ? { dateDebut: s.debut, dateFin: s.fin } : { dateDebut: "", dateFin: "" });
    setErreur("");
    setGenererModal(true);
  };

  return (
    <div>
      <Alert type={succes?.type} message={succes?.message} />

      {/* Sélection personne */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Sélectionner un ouvrier ou responsable
        </h3>
        <div className="flex flex-wrap gap-2">
          {ouvriers.map((o) => (
            <button
              key={o._id}
              onClick={() => {
                setSelectedPersonne(o._id);
                setSelectedType("ouvrier");
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border"
              style={{
                borderColor: selectedPersonne === o._id ? "#dc5539" : "#e5e7eb",
                backgroundColor: selectedPersonne === o._id ? "#dc55390f" : "white",
                color: selectedPersonne === o._id ? "#dc5539" : "#374151",
                transition: "all 0.15s",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: "#dc5539" }}
              >
                {o.prenom?.[0]}
                {o.nom?.[0]}
              </div>
              {o.prenom} {o.nom}
            </button>
          ))}
          {responsables.map((r) => (
            <button
              key={r._id}
              onClick={() => {
                setSelectedPersonne(r._id);
                setSelectedType("responsable");
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border"
              style={{
                borderColor: selectedPersonne === r._id ? "#2563eb" : "#e5e7eb",
                backgroundColor: selectedPersonne === r._id ? "#2563eb0f" : "white",
                color: selectedPersonne === r._id ? "#2563eb" : "#374151",
                transition: "all 0.15s",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: "#2563eb" }}
              >
                {r.prenom?.[0]}
                {r.nom?.[0]}
              </div>
              {r.prenom} {r.nom}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                R
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedPersonne && (
        <>
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMois}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3
                className="text-lg font-bold text-gray-800 min-w-[200px] text-center"
                style={{ textTransform: "capitalize" }}
              >
                {nomMois(moisFiltre)}
              </h3>
              <button
                onClick={nextMois}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const n = new Date();
                  setMoisFiltre(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Mois actuel
              </button>
            </div>
            <button
              onClick={openGenerer}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#dc5539" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#c44a30")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc5539")}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Générer paiement
            </button>
          </div>

          {/* Résumé du mois */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Dû ce mois (pointages)</p>
              <p className="text-xl font-bold text-gray-800">{totalDuMois} DT</p>
              {resumeMois && (
                <p className="text-xs text-gray-400 mt-1">{resumeMois.jours} j × {resumeMois.tarif} DT</p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Total payé</p>
              <p className="text-xl font-bold" style={{ color: "#16a34a" }}>
                {totalPayeMois} DT
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Restant</p>
              <p
                className="text-xl font-bold"
                style={{ color: totalRestantMois > 0 ? "#dc2626" : "#16a34a" }}
              >
                {totalRestantMois} DT
              </p>
            </div>
          </div>

          {/* Tableau paiements du mois */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Période</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Payé</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Restant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Date paiement</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paiementsDuMois.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-sm text-gray-400">
                      Aucun paiement généré pour ce mois
                    </td>
                  </tr>
                ) : (
                  paiementsDuMois.map((p) => {
                    const ss = statutStyle(p.statutPaiement);
                    return (
                      <tr
                        key={p._id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                        style={{ transition: "background-color 0.1s" }}
                      >
                        <td className="px-5 py-3 text-sm text-gray-700">
                          {formatDate(p.dateDebut)} — {formatDate(p.dateFin)}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-800">
                          {p.montantTotal} DT
                        </td>
                        <td className="px-5 py-3 text-sm font-medium" style={{ color: "#16a34a" }}>
                          {p.montantPaye} DT
                        </td>
                        <td
                          className="px-5 py-3 text-sm font-medium"
                          style={{ color: p.montantRestant > 0 ? "#dc2626" : "#16a34a" }}
                        >
                          {p.montantRestant} DT
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: ss.bg, color: ss.color }}
                          >
                            {p.statutPaiement}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">
                          {formatDate(p.datePaiement)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {p.montantRestant > 0 && (
                              <button
                                onClick={() => {
                                  setPayerModal(p._id);
                                  setPayerMontant("");
                                  setErreur("");
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                                style={{ backgroundColor: "#16a34a" }}
                              >
                                Payer
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                              style={{ transition: "all 0.15s" }}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(p._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                              style={{ transition: "all 0.15s" }}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Générer — avec présets semaines */}
      {genererModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setGenererModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Générer un paiement
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Pour : <strong>{personneNom()}</strong>
            </p>

            {/* Présets semaines */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Semaines de{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {nomMois(moisFiltre)}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {semainsDuMois.map((s, i) => {
                  const selected =
                    genererForm.dateDebut === s.debut &&
                    genererForm.dateFin === s.fin;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setGenererForm({ dateDebut: s.debut, dateFin: s.fin })
                      }
                      className="px-2.5 py-1 text-xs rounded-lg border transition-all"
                      style={{
                        borderColor: selected ? "#dc5539" : "#e5e7eb",
                        backgroundColor: selected ? "#dc55390f" : "white",
                        color: selected ? "#dc5539" : "#6b7280",
                      }}
                    >
                      S{i + 1} : {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {erreur && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: "#dc55391a", color: "#dc5539" }}
              >
                {erreur}
              </div>
            )}

            <form onSubmit={handleGenerer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={genererForm.dateDebut}
                    onChange={(e) =>
                      setGenererForm({ ...genererForm, dateDebut: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={genererForm.dateFin}
                    onChange={(e) =>
                      setGenererForm({ ...genererForm, dateFin: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGenererModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  Générer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Payer */}
      {payerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setPayerModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Enregistrer un paiement
            </h3>
            {erreur && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: "#dc55391a", color: "#dc5539" }}
              >
                {erreur}
              </div>
            )}
            <form onSubmit={handlePayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (DT)
                </label>
                <input
                  type="number"
                  value={payerMontant}
                  onChange={(e) => setPayerMontant(e.target.value)}
                  required
                  min="1"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayerModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#16a34a" }}
                >
                  Payer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setEditModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Modifier le paiement
            </h3>
            <form onSubmit={handleModifier} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={editForm.dateDebut}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateDebut: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={editForm.dateFin}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateFin: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant payé (DT)
                </label>
                <input
                  type="number"
                  value={editForm.montantPaye}
                  onChange={(e) =>
                    setEditForm({ ...editForm, montantPaye: e.target.value })
                  }
                  required
                  min="0"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDelete
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleSupprimer(deleteConfirm)}
        title="Supprimer le paiement ?"
        message="Cette action est irréversible."
      />
    </div>
  );
};

export default PaiementsOuvriers;
