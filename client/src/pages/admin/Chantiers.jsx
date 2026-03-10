import { useState } from "react";
import {
  useGetChantiersQuery,
  useCreerChantierMutation,
  useModifierChantierMutation,
  useSupprimerChantierMutation,
  useChangerEtatMutation,
} from "../../services/chantierApiSlice";
import { useGetResponsablesQuery } from "../../services/responsableApiSlice";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import ConfirmDelete from "../../components/ConfirmDelete";
import { useEffect } from "react";
import socket from "../../services/socket";
import {
  LoadingSpinner,
  PlusIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
} from "../../components/icons/SvgIcons";
import BadgeSelect from "../../components/BadgeSelect";
import SearchInput from "../../components/SearchInput";

const CHANTIER_ETAT_OPTIONS = [
  { value: "Planifié", bg: "#dbeafe", color: "#2563eb" },
  { value: "En cours", bg: "#dcfce7", color: "#16a34a" },
  { value: "En retard", bg: "#fee2e2", color: "#dc2626" },
  { value: "Terminé", bg: "#f3e8ff", color: "#9333ea" },
  { value: "Suspendu", bg: "#fef3c7", color: "#d97706" },
];

const Chantiers = () => {
  const {
    data: chantiers = [],
    isLoading,
    refetch: refetchChantiers,
  } = useGetChantiersQuery();
  const { data: responsables = [] } = useGetResponsablesQuery();
  const [creerChantier] = useCreerChantierMutation();
  const [modifierChantier] = useModifierChantierMutation();
  const [supprimerChantier] = useSupprimerChantierMutation();
  const [changerEtat] = useChangerEtatMutation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState({
    nom: "",
    localisation: "",
    dateDebut: "",
    dateFinPrevue: "",
    budget: "",
    etat: "Planifié",
    responsable: "",
  });

  const filteredChantiers = chantiers.filter((c) =>
    `${c.nom} ${c.localisation} ${c.responsable?.nom || ""} ${c.responsable?.prenom || ""}`
      .toLowerCase()
      .includes(recherche.toLowerCase()),
  );

  // Responsables déjà assignés à un chantier (sauf le chantier en cours d'édition)
  const responsablesAssignes = chantiers
    .filter((c) => c.responsable && c._id !== selectedId)
    .map((c) => c.responsable._id);

  const responsablesDisponibles = responsables.filter(
    (r) => !responsablesAssignes.includes(r._id),
  );

  const openCreate = () => {
    setForm({
      nom: "",
      localisation: "",
      dateDebut: "",
      dateFinPrevue: "",
      budget: "",
      etat: "Planifié",
      responsable: "",
    });
    setEditMode(false);
    setSelectedId(null);
    setErreur("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setForm({
      nom: c.nom,
      localisation: c.localisation,
      dateDebut: c.dateDebut?.split("T")[0] || "",
      dateFinPrevue: c.dateFinPrevue?.split("T")[0] || "",
      budget: c.budget || "",
      etat: c.etat,
      responsable: c.responsable?._id || "",
    });
    setEditMode(true);
    setSelectedId(c._id);
    setErreur("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    if (new Date(form.dateFinPrevue) <= new Date(form.dateDebut)) {
      setErreur(
        "La date de fin prévue doit être postérieure à la date de début",
      );
      return;
    }
    try {
      const data = {
        ...form,
        budget: Number(form.budget),
        responsable: form.responsable || null,
      };

      if (editMode) {
        await modifierChantier({ id: selectedId, ...data }).unwrap();
        setSucces({ type: "warning", message: "Chantier modifié avec succès" });
      } else {
        await creerChantier(data).unwrap();
        setSucces({ type: "success", message: "Chantier créé avec succès" });
      }
      setModalOpen(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerChantier(id).unwrap();
      setDeleteConfirm(null);
      setSucces({ type: "delete", message: "Chantier supprimé avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEtat = async (id, etat) => {
    try {
      await changerEtat({ id, etat }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  // Couleur des états
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

  // Couleur barre d'avancement
  const avancementColor = (pct) => {
    if (pct >= 75) return "#16a34a";
    if (pct >= 50) return "#dc5539";
    if (pct >= 25) return "#d97706";
    return "#9ca3af";
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatMontant = (m) => {
    if (!m && m !== 0) return "—";
    return m.toLocaleString("fr-FR") + " DT";
  };

  useEffect(() => {
    socket.on("travail-updated", () => refetchChantiers());
    socket.on("tache-updated", () => refetchChantiers());
    socket.on("chantier-updated", () => refetchChantiers());

    return () => {
      socket.off("travail-updated");
      socket.off("tache-updated");
      socket.off("chantier-updated");
    };
  }, [refetchChantiers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={8} color="#dc5539" />
      </div>
    );
  }

  return (
    <div>
      {/* Messages */}
      <Alert type={succes?.type} message={succes?.message} />

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Chantiers</h2>
          <div className="flex items-center gap-3">
            <SearchInput
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-56"
            />
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium"
              style={{
                backgroundColor: "#dc5539",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#c44a30")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc5539")}
            >
              <PlusIcon width={16} height={16} color="currentColor" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block ">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Nom
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Localisation
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Responsable
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Dates
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  État
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Avancement
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Budget
                </th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredChantiers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    Aucun chantier trouvé
                  </td>
                </tr>
              ) : (
                filteredChantiers.map((c) => {
                  const es = etatStyle(c.etat);
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                      style={{ transition: "background-color 0.1s" }}
                    >
                      <td className="py-3.5 px-3 text-sm text-gray-800 font-medium">
                        {c.nom}
                      </td>
                      <td className="py-3.5 px-3 text-sm text-gray-500">
                        {c.localisation}
                      </td>
                      <td className="py-3.5 px-3 text-sm text-gray-600">
                        {c.responsable ? (
                          `${c.responsable.prenom} ${c.responsable.nom}`
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-sm text-gray-500">
                        {formatDate(c.dateDebut)} →{" "}
                        {formatDate(c.dateFinPrevue)}
                      </td>
                      <td className="py-3.5 px-3">
                        <BadgeSelect
                          value={c.etat}
                          onChange={(val) => handleEtat(c._id, val)}
                          options={CHANTIER_ETAT_OPTIONS}
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.avancement || 0}%`,
                                backgroundColor: avancementColor(
                                  c.avancement || 0,
                                ),
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {c.avancement || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-sm text-gray-800 font-semibold">
                          {formatMontant(c.budget)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Dépensé: {formatMontant(c.totalDepense || 0)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                            style={{ transition: "all 0.15s" }}
                          >
                            <EditIcon
                              width={16}
                              height={16}
                              color="currentColor"
                            />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/chantiers/${c._id}`)
                            }
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                            style={{ transition: "all 0.15s" }}
                          >
                            <EyeIcon
                              width={16}
                              height={16}
                              color="currentColor"
                            />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(c._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                            style={{ transition: "all 0.15s" }}
                          >
                            <TrashIcon
                              width={16}
                              height={16}
                              color="currentColor"
                            />
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

        {/* Mobile cards */}
        <div className="block sm:hidden space-y-3 p-1">
          {filteredChantiers.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">
              Aucun chantier trouvé
            </p>
          ) : (
            filteredChantiers.map((c) => {
              const es = etatStyle(c.etat);
              return (
                <div
                  key={c._id}
                  className="border border-gray-100 rounded-xl p-4"
                >
                  {/* Header: nom + état */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {c.nom}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.localisation}
                      </p>
                    </div>
                    <BadgeSelect
                      value={c.etat}
                      onChange={(val) => handleEtat(c._id, val)}
                      options={CHANTIER_ETAT_OPTIONS}
                    />
                  </div>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-xs">
                    <div>
                      <p className="text-gray-400">Responsable</p>
                      <p className="text-gray-700 font-medium mt-0.5">
                        {c.responsable
                          ? `${c.responsable.prenom} ${c.responsable.nom}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Budget</p>
                      <p className="text-gray-800 font-semibold mt-0.5">
                        {formatMontant(c.budget)}
                      </p>
                      <p className="text-gray-400">
                        Dépensé: {formatMontant(c.totalDepense || 0)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Dates</p>
                      <p className="text-gray-600 mt-0.5">
                        {formatDate(c.dateDebut)} →{" "}
                        {formatDate(c.dateFinPrevue)}
                      </p>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Avancement</span>
                      <span className="text-xs font-semibold text-gray-600">
                        {c.avancement || 0}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.avancement || 0}%`,
                          backgroundColor: avancementColor(c.avancement || 0),
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg"
                    >
                      <EditIcon width={12} height={12} color="currentColor" />{" "}
                      Modifier
                    </button>
                    <button
                      onClick={() => navigate(`/admin/chantiers/${c._id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg"
                    >
                      <EyeIcon width={12} height={12} color="currentColor" />{" "}
                      Détails
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(c._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg"
                    >
                      <TrashIcon width={12} height={12} color="currentColor" />{" "}
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Créer/Modifier */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Modifier le chantier" : "Ajouter un chantier"}
            </h3>

            {erreur && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: "#dc55391a", color: "#dc5539" }}
              >
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du chantier
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
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
                    value={form.localisation}
                    onChange={(e) =>
                      setForm({ ...form, localisation: e.target.value })
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
                    value={form.dateDebut}
                    onChange={(e) =>
                      setForm({ ...form, dateDebut: e.target.value })
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
                    value={form.dateFinPrevue}
                    onChange={(e) =>
                      setForm({ ...form, dateFinPrevue: e.target.value })
                    }
                    required
                    min={form.dateDebut || undefined}
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
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
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
                    value={form.etat}
                    onChange={(e) => setForm({ ...form, etat: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                  value={form.responsable}
                  onChange={(e) =>
                    setForm({ ...form, responsable: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                >
                  <option value="">— Aucun responsable —</option>
                  {responsablesDisponibles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.prenom} {r.nom}
                    </option>
                  ))}
                  {/* Si en mode édition, afficher aussi le responsable actuel */}
                  {editMode &&
                    form.responsable &&
                    !responsablesDisponibles.find(
                      (r) => r._id === form.responsable,
                    ) &&
                    (() => {
                      const current = responsables.find(
                        (r) => r._id === form.responsable,
                      );
                      return current ? (
                        <option key={current._id} value={current._id}>
                          {current.prenom} {current.nom}
                        </option>
                      ) : null;
                    })()}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  {editMode ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDelete
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Supprimer le chantier ?"
        message="Toutes les données associées (travaux, tâches, notes, coûts) seront supprimées."
      />
    </div>
  );
};

export default Chantiers;
