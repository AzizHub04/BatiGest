import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetChantierQuery,
  useModifierChantierMutation,
} from "../../services/chantierApiSlice";
import Alert from "../../components/Alert";
import {
  useGetCoutsByChantierQuery,
  useCreerCoutMutation,
  useModifierCoutMutation,
  useSupprimerCoutMutation,
} from "../../services/coutApiSlice";
import { useGetResponsablesQuery } from "../../services/responsableApiSlice";
import { useEffect } from "react";
import socket from "../../services/socket";
import TravauxSection from "../../components/chantier/TravauxSection";
import NotesSection from "../../components/chantier/NotesSection";
import {
  LoadingSpinner,
  ChevronLeftIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from "../../components/icons/SvgIcons";

// Page principale
const ChantierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: chantier,
    isLoading,
    refetch: refetchChantier,
  } = useGetChantierQuery(id);
  const { data: coutsData } = useGetCoutsByChantierQuery(id);

  const [creerCout] = useCreerCoutMutation();
  const [modifierCout] = useModifierCoutMutation();
  const [supprimerCout] = useSupprimerCoutMutation();
  const [modifierChantierMut] = useModifierChantierMutation();
  const { data: responsables = [] } = useGetResponsablesQuery();

  const [onglet, setOnglet] = useState("travaux");

  // Modals
  const [coutModal, setCoutModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [chantierModal, setChantierModal] = useState(false);
  const [chantierForm, setChantierForm] = useState({
    nom: "",
    localisation: "",
    dateDebut: "",
    dateFinPrevue: "",
    budget: "",
    etat: "",
    responsable: "",
  });

  const [coutForm, setCoutForm] = useState({
    type: "Dépense",
    montant: "",
    description: "",
    modePaiement: "Espèces",
  });

  const [succes, setSucces] = useState(null);
  const [erreurChantier, setErreurChantier] = useState("");

  // === CHANTIER ===
  const openEditChantier = () => {
    setChantierForm({
      nom: chantier.nom,
      localisation: chantier.localisation,
      dateDebut: chantier.dateDebut?.split("T")[0] || "",
      dateFinPrevue: chantier.dateFinPrevue?.split("T")[0] || "",
      budget: chantier.budget || "",
      etat: chantier.etat,
      responsable: chantier.responsable?._id || "",
    });
    setErreurChantier("");
    setChantierModal(true);
  };

  const handleChantier = async (e) => {
    e.preventDefault();
    if (new Date(chantierForm.dateFinPrevue) <= new Date(chantierForm.dateDebut)) {
      setErreurChantier('La date de fin prévue doit être postérieure à la date de début');
      return;
    }
    try {
      await modifierChantierMut({
        id,
        ...chantierForm,
        budget: Number(chantierForm.budget),
        responsable: chantierForm.responsable || null,
      }).unwrap();
      setChantierModal(false);
      setSucces({ type: "warning", message: "Chantier modifié avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };
  // === COÛTS ===
  const openCreateCout = () => {
    setCoutForm({
      type: "Dépense",
      montant: "",
      description: "",
      modePaiement: "Espèces",
    });
    setEditMode(false);
    setSelectedId(null);
    setCoutModal(true);
  };

  const openEditCout = (c) => {
    setCoutForm({
      type: c.type,
      montant: c.montant,
      description: c.description || "",
      modePaiement: c.modePaiement,
    });
    setEditMode(true);
    setSelectedId(c._id);
    setCoutModal(true);
  };

  const handleCout = async (e) => {
    e.preventDefault();
    try {
      const data = { ...coutForm, montant: Number(coutForm.montant) };
      if (editMode) {
        await modifierCout({ id: selectedId, ...data }).unwrap();
        setSucces({ type: "warning", message: "Opération modifiée" });
      } else {
        await creerCout({ ...data, chantier: id }).unwrap();
        setSucces({ type: "success", message: "Opération enregistrée" });
      }
      setCoutModal(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
  const formatMontant = (m) => (m || 0).toLocaleString("fr-FR") + " DT";

  const etatStyle = (etat) => {
    switch (etat) {
      case "Planifié":
        return { bg: "#dbeafe", color: "#2563eb" };
      case "En cours":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "En retard":
        return { bg: "#fee2e2", color: "#dc2626" };
      case "Terminé":
        return { bg: "#f3e8ff", color: "#9333ea" };
      case "Suspendu":
        return { bg: "#fef3c7", color: "#d97706" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };
  useEffect(() => {
    socket.emit('join-chantier', id);

    socket.on('chantier-updated', () => refetchChantier());
    socket.on('travail-updated', () => refetchChantier());
    socket.on('tache-updated', () => refetchChantier());
    return () => {
      socket.off('chantier-updated');
      socket.off('travail-updated');
      socket.off('tache-updated');
    };
  }, [id, refetchChantier]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={8} color="#dc5539" />
      </div>
    );
  }

  if (!chantier) return <p className="text-gray-500">Chantier non trouvé</p>;

  const es = etatStyle(chantier.etat);

  return (
    <div>
      {/* Bouton retour */}
      <button
        onClick={() => navigate("/admin/chantiers")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
        style={{ transition: "color 0.15s" }}
      >
        <ChevronLeftIcon width={16} height={16} color="currentColor" />
        Retour aux chantiers
      </button>

      {/* Header chantier */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{chantier.nom}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {chantier.localisation}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ backgroundColor: es.bg, color: es.color }}
            >
              {chantier.etat}
            </span>
            <button
              onClick={openEditChantier}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
              style={{ transition: "all 0.15s" }}
            >
              <EditIcon width={18} height={18} color="currentColor" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">Responsable</p>
            <p className="text-sm font-medium text-gray-800">
              {chantier.responsable
                ? `${chantier.responsable.prenom} ${chantier.responsable.nom}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Dates</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(chantier.dateDebut)} →{" "}
              {formatDate(chantier.dateFinPrevue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Budget</p>
            <p className="text-sm font-medium text-gray-800">
              {formatMontant(chantier.budget)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Avancement</p>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${chantier.avancement || 0}%`,
                    backgroundColor: "#dc5539",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-800">
                {chantier.avancement || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message succès */}
      <Alert type={succes?.type} message={succes?.message} />

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { id: "travaux", label: "Travaux" },
          { id: "financement", label: "Financement" },
          { id: "notes", label: "Notes" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOnglet(tab.id)}
            className="px-4 py-2.5 text-sm font-medium border-b-2"
            style={{
              borderColor: onglet === tab.id ? "#dc5539" : "transparent",
              color: onglet === tab.id ? "#dc5539" : "#6b7280",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== ONGLET TRAVAUX ===== */}
      {onglet === "travaux" && <TravauxSection chantierId={id} />}

      {/* ===== ONGLET FINANCEMENT ===== */}
      {onglet === "financement" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {/* Résumé financier */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#dbeafe" }}
            >
              <p className="text-xs font-medium" style={{ color: "#2563eb" }}>
                Budget initial
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: "#1e40af" }}
              >
                {formatMontant(coutsData?.budget)}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <p className="text-xs font-medium" style={{ color: "#dc2626" }}>
                Total dépenses
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: "#991b1b" }}
              >
                {formatMontant(coutsData?.totalDepense)}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#dcfce7" }}
            >
              <p className="text-xs font-medium" style={{ color: "#16a34a" }}>
                Total reçu
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: "#166534" }}
              >
                {formatMontant(coutsData?.totalRecu)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Opérations</h3>
            <button
              onClick={openCreateCout}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#dc5539" }}
            >
              <PlusIcon width={16} height={16} color="currentColor" />
              Ajouter
            </button>
          </div>

          {!coutsData?.couts || coutsData.couts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune opération</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Description</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Mode</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Montant</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coutsData.couts.map((c) => (
                      <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50" style={{ transition: "background-color 0.1s" }}>
                        <td className="py-3 px-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.type === "Dépense" ? "#fee2e2" : "#dcfce7", color: c.type === "Dépense" ? "#dc2626" : "#16a34a" }}>{c.type}</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">{c.description || "—"}</td>
                        <td className="py-3 px-3 text-sm text-gray-500">{c.modePaiement}</td>
                        <td className="py-3 px-3 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                        <td className="py-3 px-3 text-sm font-semibold text-right" style={{ color: c.type === "Dépense" ? "#dc2626" : "#16a34a" }}>
                          {c.type === "Dépense" ? "-" : "+"}{formatMontant(c.montant)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditCout(c)} className="p-1 text-gray-400 hover:text-blue-500">
                              <EditIcon width={14} height={14} color="currentColor" />
                            </button>
                            <button onClick={async () => { await supprimerCout(c._id).unwrap(); setSucces({ type: "delete", message: "Opération supprimée" }); setTimeout(() => setSucces(null), 3000); }} className="p-1 text-gray-400 hover:text-red-500">
                              <TrashIcon width={14} height={14} color="currentColor" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="block sm:hidden space-y-3 p-1">
                {coutsData.couts.map((c) => (
                  <div key={c._id} className="border border-gray-100 rounded-xl p-4">
                    {/* Header: montant + type badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-lg font-bold" style={{ color: c.type === "Dépense" ? "#dc2626" : "#16a34a" }}>
                          {c.type === "Dépense" ? "-" : "+"}{formatMontant(c.montant)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.description || "—"}</p>
                      </div>
                      <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: c.type === "Dépense" ? "#fee2e2" : "#dcfce7", color: c.type === "Dépense" ? "#dc2626" : "#16a34a" }}>
                        {c.type}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <p className="text-gray-400">Mode</p>
                        <p className="text-gray-700 font-medium mt-0.5">{c.modePaiement}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date</p>
                        <p className="text-gray-700 font-medium mt-0.5">{formatDate(c.createdAt)}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => openEditCout(c)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">
                        <EditIcon width={12} height={12} color="currentColor" /> Modifier
                      </button>
                      <button onClick={async () => { await supprimerCout(c._id).unwrap(); setSucces({ type: "delete", message: "Opération supprimée" }); setTimeout(() => setSucces(null), 3000); }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg">
                        <TrashIcon width={12} height={12} color="currentColor" /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== ONGLET NOTES ===== */}
      {onglet === "notes" && <NotesSection chantierId={id} />}

      {/* Modal Coût */}
      {coutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setCoutModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Modifier l'opération" : "Ajouter une opération"}
            </h3>
            <form onSubmit={handleCout} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={coutForm.type}
                    onChange={(e) =>
                      setCoutForm({ ...coutForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  >
                    <option value="Dépense">Dépense</option>
                    <option value="Règlement">Règlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant (DT)
                  </label>
                  <input
                    type="number"
                    value={coutForm.montant}
                    onChange={(e) =>
                      setCoutForm({ ...coutForm, montant: e.target.value })
                    }
                    required
                    min="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={coutForm.description}
                  onChange={(e) =>
                    setCoutForm({ ...coutForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement
                </label>
                <select
                  value={coutForm.modePaiement}
                  onChange={(e) =>
                    setCoutForm({ ...coutForm, modePaiement: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCoutModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {editMode ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Chantier */}
      {/* Modal Modifier Chantier */}
      {chantierModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setChantierModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Modifier le chantier
            </h3>
            {erreurChantier && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: "#dc55391a", color: "#dc5539" }}
              >
                {erreurChantier}
              </div>
            )}
            <form onSubmit={handleChantier} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={chantierForm.nom}
                    onChange={(e) =>
                      setChantierForm({ ...chantierForm, nom: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={chantierForm.localisation}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        localisation: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={chantierForm.dateDebut}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        dateDebut: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin prévue
                  </label>
                  <input
                    type="date"
                    value={chantierForm.dateFinPrevue}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        dateFinPrevue: e.target.value,
                      })
                    }
                    required
                    min={chantierForm.dateDebut || undefined}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (DT)
                  </label>
                  <input
                    type="number"
                    value={chantierForm.budget}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        budget: e.target.value,
                      })
                    }
                    required
                    min="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    État
                  </label>
                  <select
                    value={chantierForm.etat}
                    onChange={(e) =>
                      setChantierForm({ ...chantierForm, etat: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="En retard">En retard</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsable
                </label>
                <select
                  value={chantierForm.responsable}
                  onChange={(e) =>
                    setChantierForm({
                      ...chantierForm,
                      responsable: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                >
                  <option value="">— Aucun responsable —</option>
                  {responsables.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.prenom} {r.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChantierModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                  style={{ transition: "background-color 0.15s" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: "#dc5539",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#c44a30")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#dc5539")
                  }
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChantierDetail;
