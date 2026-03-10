import { useState } from "react";
import {
  useGetMaterielsQuery,
  useCreerMaterielMutation,
  useModifierMaterielMutation,
  useSupprimerMaterielMutation,
} from "../../services/materielApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";

const ListeMateriels = () => {
  const { data: materiels = [], isLoading } = useGetMaterielsQuery();
  const [creerMateriel] = useCreerMaterielMutation();
  const [modifierMateriel] = useModifierMaterielMutation();
  const [supprimerMateriel] = useSupprimerMaterielMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [form, setForm] = useState({
    nom: "",
    categorie: "",
    unite: "",
    quantiteStock: "",
  });

  const filtres = materiels.filter((m) =>
    `${m.nom} ${m.categorie}`.toLowerCase().includes(recherche.toLowerCase()),
  );

  const openCreate = () => {
    setForm({ nom: "", categorie: "", unite: "", quantiteStock: "" });
    setEditMode(false);
    setSelectedId(null);
    setErreur("");
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setForm({
      nom: m.nom,
      categorie: m.categorie,
      unite: m.unite,
      quantiteStock: m.quantiteStock,
    });
    setEditMode(true);
    setSelectedId(m._id);
    setErreur("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      if (editMode) {
        await modifierMateriel({
          id: selectedId,
          ...form,
          quantiteStock: Number(form.quantiteStock),
        }).unwrap();
        setSucces({ type: "warning", message: "Matériel modifié avec succès" });
      } else {
        await creerMateriel({
          ...form,
          quantiteStock: Number(form.quantiteStock),
        }).unwrap();
        setSucces({ type: "success", message: "Matériel créé avec succès" });
      }
      setModalOpen(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerMateriel(id).unwrap();
      setDeleteConfirm(null);
      setSucces({ type: "delete", message: "Matériel supprimé avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
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
            placeholder="Rechercher un matériel..."
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
          Nouveau matériel
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Matériel
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Catégorie
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Unité
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                En stock
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Dehors
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtres.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-sm text-gray-400"
                >
                  Aucun matériel trouvé
                </td>
              </tr>
            ) : (
              filtres.map((m) => (
                <tr
                  key={m._id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  style={{ transition: "background-color 0.1s" }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#dc55391a" }}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="#dc5539"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {m.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                    >
                      {m.categorie}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{m.unite}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: m.quantiteStock > 0 ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {m.quantiteStock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: m.quantiteDehors > 0 ? "#d97706" : "#9ca3af",
                      }}
                    >
                      {m.quantiteDehors}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(m)}
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
                        onClick={() => setDeleteConfirm(m._id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

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
              {editMode ? "Modifier le matériel" : "Nouveau matériel"}
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
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={form.categorie}
                    onChange={(e) =>
                      setForm({ ...form, categorie: e.target.value })
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
                    Unité
                  </label>
                  <input
                    type="text"
                    value={form.unite}
                    onChange={(e) =>
                      setForm({ ...form, unite: e.target.value })
                    }
                    required
                    placeholder="Sac, Barre, Kg..."
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
                    Quantité en stock
                  </label>
                  <input
                    type="number"
                    value={form.quantiteStock}
                    onChange={(e) =>
                      setForm({ ...form, quantiteStock: e.target.value })
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
        title="Supprimer le matériel ?"
        message="Les mouvements associés seront aussi supprimés."
      />
    </div>
  );
};

export default ListeMateriels;
