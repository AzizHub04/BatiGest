import { useState, useMemo } from "react";
import { useGetOuvriersQuery } from "../../services/ouvrierApiSlice";
import { useGetResponsablesQuery } from "../../services/responsableApiSlice";
import {
  useGetAutoResumeQuery,
  useGenererPaiementMutation,
  useReglerPaiementMutation,
  useModifierPaiementMutation,
  useSupprimerPaiementMutation,
} from "../../services/paiementOuvrierApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../../components/ConfirmDelete";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return "—";
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, mo, dd] = d.substring(0, 10).split("-").map(Number);
    return `${String(dd).padStart(2, "0")}/${String(mo).padStart(2, "0")}/${y}`;
  }
  return new Date(d).toLocaleDateString("fr-FR");
};

const statutStyle = (s) => {
  if (s === "Payé") return { bg: "#dcfce7", color: "#16a34a" };
  if (s === "Partiel") return { bg: "#fef3c7", color: "#d97706" };
  return { bg: "#fee2e2", color: "#dc2626" };
};

const nomMoisLabel = (mois) => {
  const [annee, m] = mois.split("-").map(Number);
  return new Date(annee, m - 1, 15).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
};

// ─── Composant principal ──────────────────────────────────────────────────────
const PaiementsOuvriers = () => {
  const now = new Date();
  const [moisFiltre, setMoisFiltre] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );

  const { data: ouvriers = [] } = useGetOuvriersQuery();
  const { data: responsables = [] } = useGetResponsablesQuery();

  const [selectedPersonne, setSelectedPersonne] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Modals
  const [reglerModal, setReglerModal] = useState(null); // { lundiStr, label, montantRestant }
  const [reglerMontant, setReglerMontant] = useState("");
  const [genererModal, setGenererModal] = useState(false);
  const [genererForm, setGenererForm] = useState({
    dateDebut: "",
    dateFin: "",
  });
  const [modifierModal, setModifierModal] = useState(null); // { id, label, montantTotal, montantPaye }
  const [modifierMontant, setModifierMontant] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState(null); // { id, label }

  const [succes, setSucces] = useState(null);
  const [erreur, setErreur] = useState("");

  // Query params
  const queryParams = selectedPersonne
    ? selectedType === "ouvrier"
      ? { ouvrierId: selectedPersonne }
      : { responsableId: selectedPersonne }
    : null;

  const { data: autoData, isLoading: autoLoading } = useGetAutoResumeQuery(
    queryParams,
    { skip: !selectedPersonne },
  );

  const [reglerPaiement] = useReglerPaiementMutation();
  const [genererPaiement] = useGenererPaiementMutation();
  const [modifierPaiement] = useModifierPaiementMutation();
  const [supprimerPaiement] = useSupprimerPaiementMutation();

  // Semaines du mois pour les présets "Générer"
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

  // Filtrer les semaines du résumé auto qui chevauchent le mois sélectionné
  const resumeFiltre = useMemo(() => {
    const [annee, m] = moisFiltre.split("-").map(Number);
    const premierJour = `${moisFiltre}-01`;
    const dernierJour = `${moisFiltre}-${String(new Date(annee, m, 0).getDate()).padStart(2, "0")}`;
    return (autoData?.resume || []).filter(
      (s) => s.lundiStr <= dernierJour && s.dimancheStr >= premierJour,
    );
  }, [autoData, moisFiltre]);

  // Totaux filtrés
  const totalDu = resumeFiltre.reduce((sum, s) => sum + s.montantDu, 0);
  const totalPaye = resumeFiltre.reduce((sum, s) => sum + s.montantPaye, 0);
  const totalRestant = Math.max(0, totalDu - totalPaye);

  // Navigation mois
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

  const personneNom = () => {
    if (!selectedPersonne) return "";
    if (selectedType === "ouvrier") {
      const o = ouvriers.find((o) => o._id === selectedPersonne);
      return o ? `${o.prenom} ${o.nom}` : "";
    }
    const r = responsables.find((r) => r._id === selectedPersonne);
    return r ? `${r.prenom} ${r.nom}` : "";
  };

  // Handlers
  const handleRegler = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      const data = {
        lundiStr: reglerModal.lundiStr,
        montant: Number(reglerMontant),
      };
      if (selectedType === "ouvrier") data.ouvrierId = selectedPersonne;
      else data.responsableId = selectedPersonne;
      await reglerPaiement(data).unwrap();
      setReglerModal(null);
      setReglerMontant("");
      setSucces({ type: "success", message: "Paiement enregistré" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
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

  const handleModifier = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      await modifierPaiement({
        id: modifierModal.id,
        montantPaye: Number(modifierMontant),
      }).unwrap();
      setModifierModal(null);
      setModifierMontant("");
      setSucces({ type: "success", message: "Paiement modifié" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleSupprimer = async () => {
    try {
      await supprimerPaiement(confirmSuppr.id).unwrap();
      setConfirmSuppr(null);
      setSucces({ type: "success", message: "Paiement supprimé" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const openGenerer = () => {
    const s = semainsDuMois[0];
    setGenererForm(
      s
        ? { dateDebut: s.debut, dateFin: s.fin }
        : { dateDebut: "", dateFin: "" },
    );
    setErreur("");
    setGenererModal(true);
  };

  return (
    <div>
      <Alert type={succes?.type} message={succes?.message} />

      {/* ── Sélection personne ──────────────────────────────────────────── */}
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
                backgroundColor:
                  selectedPersonne === o._id ? "#dc55390f" : "white",
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
                backgroundColor:
                  selectedPersonne === r._id ? "#2563eb0f" : "white",
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
          {/* ── Navigation mois ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMois}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3
                className="text-lg font-bold text-gray-800 min-w-[200px] text-center"
                style={{ textTransform: "capitalize" }}
              >
                {nomMoisLabel(moisFiltre)}
              </h3>
              <button
                onClick={nextMois}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const n = new Date();
                  setMoisFiltre(
                    `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`,
                  );
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#c44a30")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#dc5539")
              }
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Générer manuellement
            </button>
          </div>

          {/* ── Cartes résumé ───────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">
                Dû ce mois (pointages)
              </p>
              <p className="text-xl font-bold text-gray-800">{totalDu} DT</p>
              {resumeFiltre.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {resumeFiltre.reduce((s, r) => s + r.joursTravailes, 0)} j ×{" "}
                  {resumeFiltre[0]?.tarif} DT
                </p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Total payé</p>
              <p className="text-xl font-bold" style={{ color: "#16a34a" }}>
                {totalPaye} DT
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Restant</p>
              <p
                className="text-xl font-bold"
                style={{ color: totalRestant > 0 ? "#dc2626" : "#16a34a" }}
              >
                {totalRestant} DT
              </p>
            </div>
          </div>

          {/* ── Tableau automatique par semaine ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Semaine
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Jours
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Montant dû
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Payé
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Restant
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Statut
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Date paiement
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {autoLoading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-8 text-sm text-gray-400"
                    >
                      Chargement…
                    </td>
                  </tr>
                ) : resumeFiltre.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-8 text-sm text-gray-400"
                    >
                      Aucun pointage pour ce mois
                    </td>
                  </tr>
                ) : (
                  resumeFiltre.map((s) => {
                    const ss = statutStyle(s.statut);
                    return (
                      <tr
                        key={s.lundiStr}
                        className="border-b border-gray-50 hover:bg-gray-50"
                        style={{ transition: "background-color 0.1s" }}
                      >
                        <td className="px-5 py-3 text-sm font-medium text-gray-700">
                          {s.label}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">
                          {s.joursTravailes} j
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-800">
                          {s.montantDu} DT
                        </td>
                        <td
                          className="px-5 py-3 text-sm font-medium"
                          style={{ color: "#16a34a" }}
                        >
                          {s.montantPaye} DT
                        </td>
                        <td
                          className="px-5 py-3 text-sm font-medium"
                          style={{
                            color: s.montantRestant > 0 ? "#dc2626" : "#16a34a",
                          }}
                        >
                          {s.montantRestant} DT
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: ss.bg, color: ss.color }}
                          >
                            {s.statut}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">
                          {s.datePaiement
                            ? formatDate(
                                typeof s.datePaiement === "string"
                                  ? s.datePaiement
                                  : new Date(s.datePaiement)
                                      .toISOString()
                                      .split("T")[0],
                              )
                            : "—"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {s.montantRestant > 0 && (
                              <button
                                onClick={() => {
                                  setReglerModal({
                                    lundiStr: s.lundiStr,
                                    label: s.label,
                                    montantRestant: s.montantRestant,
                                  });
                                  setReglerMontant(String(s.montantRestant));
                                  setErreur("");
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                                style={{ backgroundColor: "#16a34a" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#15803d")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#16a34a")
                                }
                              >
                                Régler
                              </button>
                            )}
                            {s.paiementId && (
                              <>
                                {/* Modifier */}
                                <button
                                  title="Modifier"
                                  onClick={() => {
                                    setModifierModal({
                                      id: s.paiementId,
                                      label: s.label,
                                      montantTotal: s.montantDu,
                                      montantPaye: s.montantPaye,
                                    });
                                    setModifierMontant(String(s.montantPaye));
                                    setErreur("");
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                {/* Supprimer */}
                                <button
                                  title="Supprimer"
                                  onClick={() =>
                                    setConfirmSuppr({
                                      id: s.paiementId,
                                      label: s.label,
                                    })
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50"
                                  style={{ color: "#dc5539" }}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </>
                            )}
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

      {/* ── Modal Régler ────────────────────────────────────────────────── */}
      {reglerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setReglerModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Régler la semaine
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{personneNom()}</strong> — {reglerModal.label}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Restant :{" "}
              <strong style={{ color: "#dc2626" }}>
                {reglerModal.montantRestant} DT
              </strong>
            </p>
            {erreur && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: "#dc55391a", color: "#dc5539" }}
              >
                {erreur}
              </div>
            )}
            <form onSubmit={handleRegler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant à régler (DT)
                </label>
                <input
                  type="number"
                  value={reglerMontant}
                  onChange={(e) => setReglerMontant(e.target.value)}
                  required
                  min="1"
                  max={reglerModal.montantRestant}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReglerModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#16a34a" }}
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Modifier ──────────────────────────────────────────────── */}
      {modifierModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setModifierModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Modifier le paiement
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{personneNom()}</strong> — {modifierModal.label}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Montant dû : <strong>{modifierModal.montantTotal} DT</strong>
            </p>
            {erreur && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: "#dc55391a", color: "#dc5539" }}
              >
                {erreur}
              </div>
            )}
            <form onSubmit={handleModifier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant payé (DT)
                </label>
                <input
                  type="number"
                  value={modifierMontant}
                  onChange={(e) => setModifierMontant(e.target.value)}
                  required
                  min="0"
                  max={modifierModal.montantTotal}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModifierModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression ─────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!confirmSuppr}
        onClose={() => setConfirmSuppr(null)}
        onConfirm={handleSupprimer}
        title="Supprimer le paiement"
        message={
          confirmSuppr
            ? `Supprimer le paiement de la semaine ${confirmSuppr.label} ?`
            : ""
        }
      />

      {/* ── Modal Générer manuellement ───────────────────────────────────── */}
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
                  {nomMoisLabel(moisFiltre)}
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
                      setGenererForm({
                        ...genererForm,
                        dateDebut: e.target.value,
                      })
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
                      setGenererForm({
                        ...genererForm,
                        dateFin: e.target.value,
                      })
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
    </div>
  );
};

export default PaiementsOuvriers;
