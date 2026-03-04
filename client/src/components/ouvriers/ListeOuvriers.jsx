import { useState } from "react";
import {
  useGetOuvriersQuery,
  useCreerOuvrierMutation,
  useModifierOuvrierMutation,
  useSupprimerOuvrierMutation,
} from "../../services/ouvrierApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";

const ListeOuvriers = () => {
  const { data: ouvriers = [], isLoading } = useGetOuvriersQuery();
  const [creerOuvrier] = useCreerOuvrierMutation();
  const [modifierOuvrier] = useModifierOuvrierMutation();
  const [supprimerOuvrier] = useSupprimerOuvrierMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    tarifJournalier: "",
  });

  const ouvriersFiltres = ouvriers.filter((o) =>
    `${o.nom} ${o.prenom}`.toLowerCase().includes(recherche.toLowerCase()),
  );

  const openCreate = () => {
    setForm({ nom: "", prenom: "", telephone: "", tarifJournalier: "" });
    setEditMode(false);
    setSelectedId(null);
    setErreur("");
    setModalOpen(true);
  };

  const openEdit = (o) => {
    setForm({
      nom: o.nom,
      prenom: o.prenom,
      telephone: o.telephone || "",
      tarifJournalier: o.tarifJournalier,
    });
    setEditMode(true);
    setSelectedId(o._id);
    setErreur("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      if (editMode) {
        await modifierOuvrier({
          id: selectedId,
          ...form,
          tarifJournalier: Number(form.tarifJournalier),
        }).unwrap();
        setSucces({ type: "warning", message: "Ouvrier modifié avec succès" });
      } else {
        await creerOuvrier({
          ...form,
          tarifJournalier: Number(form.tarifJournalier),
        }).unwrap();
        setSucces({ type: "success", message: "Ouvrier créé avec succès" });
      }
      setModalOpen(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerOuvrier(id).unwrap();
      setDeleteConfirm(null);
      setSucces({ type: "delete", message: "Ouvrier supprimé avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const statutStyle = (s) => {
    return s === "Actif"
      ? { bg: "#dcfce7", color: "#16a34a" }
      : { bg: "#f3f4f6", color: "#6b7280" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg
          className="animate-spin h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          style={{ color: "#dc5539" }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <Alert type={succes?.type} message={succes?.message} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un ouvrier..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-72"
            style={{ outline: "none", transition: "border-color 0.15s" }}
            onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium"
          style={{
            backgroundColor: "#dc5539",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#c44a30")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc5539")}
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
          Nouvel ouvrier
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Ouvrier
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Téléphone
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Tarif/jour
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Statut
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {ouvriersFiltres.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-sm text-gray-400"
                >
                  Aucun ouvrier trouvé
                </td>
              </tr>
            ) : (
              ouvriersFiltres.map((o) => {
                const ss = statutStyle(o.statut);
                return (
                  <tr
                    key={o._id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    style={{ transition: "background-color 0.1s" }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: "#dc5539" }}
                        >
                          {o.prenom?.[0]}
                          {o.nom?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {o.prenom} {o.nom}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {o.telephone || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">
                      {o.tarifJournalier} DT
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: ss.bg, color: ss.color }}
                      >
                        {o.statut}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(o)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                          style={{ transition: "all 0.15s" }}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(o._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          style={{ transition: "all 0.15s" }}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
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

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Modifier l'ouvrier" : "Nouvel ouvrier"}
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
                    Nom
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
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) =>
                      setForm({ ...form, prenom: e.target.value })
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
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
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
                    Tarif journalier (DT)
                  </label>
                  <input
                    type="number"
                    value={form.tarifJournalier}
                    onChange={(e) =>
                      setForm({ ...form, tarifJournalier: e.target.value })
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
        title="Supprimer l'ouvrier ?"
        message="Les pointages et paiements associés seront supprimés."
      />
    </div>
  );
};

export default ListeOuvriers;
