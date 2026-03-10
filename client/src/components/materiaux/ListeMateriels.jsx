import { useState } from "react";
import {
  useGetMaterielsQuery,
  useCreerMaterielMutation,
  useModifierMaterielMutation,
  useSupprimerMaterielMutation,
} from "../../services/materielApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";
import {
  LoadingSpinner,
  SearchIcon,
  PlusIcon,
  BoxIcon,
  EditIcon,
  TrashIcon,
} from "../icons/SvgIcons";

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
        <LoadingSpinner size={8} color="#dc5539" />
      </div>
    );
  }

  return (
    <div>
      <Alert type={succes?.type} message={succes?.message} />

      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width={16}
            height={16}
            color="#9ca3af"
          />
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
          <PlusIcon width={16} height={16} color="currentColor" />
          Nouveau matériel
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Matériel</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Catégorie</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Unité</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">En stock</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Dehors</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtres.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-sm text-gray-400">Aucun matériel trouvé</td></tr>
            ) : (
              filtres.map((m) => (
                <tr key={m._id} className="border-b border-gray-50 hover:bg-gray-50" style={{ transition: "background-color 0.1s" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#dc55391a" }}>
                        <BoxIcon width={16} height={16} color="#dc5539" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{m.nom}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>{m.categorie}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{m.unite}</td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold" style={{ color: m.quantiteStock > 0 ? "#16a34a" : "#dc2626" }}>{m.quantiteStock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold" style={{ color: m.quantiteDehors > 0 ? "#d97706" : "#9ca3af" }}>{m.quantiteDehors}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50" style={{ transition: "all 0.15s" }}>
                        <EditIcon width={16} height={16} color="currentColor" />
                      </button>
                      <button onClick={() => setDeleteConfirm(m._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" style={{ transition: "all 0.15s" }}>
                        <TrashIcon width={16} height={16} color="currentColor" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block sm:hidden space-y-3">
        {filtres.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">Aucun matériel trouvé</p>
        ) : (
          filtres.map((m) => (
            <div key={m._id} className="bg-white border border-gray-100 rounded-xl p-4">
              {/* Header: icon + nom + catégorie */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: "#dc55391a" }}>
                    <BoxIcon width={16} height={16} color="#dc5539" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{m.nom}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.unite}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>{m.categorie}</span>
              </div>
              {/* Stock info */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-gray-400">En stock</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: m.quantiteStock > 0 ? "#16a34a" : "#dc2626" }}>{m.quantiteStock}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-gray-400">Dehors</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: m.quantiteDehors > 0 ? "#d97706" : "#9ca3af" }}>{m.quantiteDehors}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(m)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">
                  <EditIcon width={12} height={12} color="currentColor" /> Modifier
                </button>
                <button onClick={() => setDeleteConfirm(m._id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg">
                  <TrashIcon width={12} height={12} color="currentColor" /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
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
