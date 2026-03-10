import { useState } from "react";
import {
  useGetResponsablesQuery,
  useCreerResponsableMutation,
  useModifierResponsableMutation,
  useSupprimerResponsableMutation,
} from "../../services/responsableApiSlice";
import { useGetChantiersQuery } from "../../services/chantierApiSlice";
import Alert from "../../components/Alert";
import ConfirmDelete from "../../components/ConfirmDelete";
import {
  LoadingSpinner,
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  EditIcon,
  TrashIcon,
} from "../../components/icons/SvgIcons";

const Responsables = () => {
  const { data: responsables = [], isLoading } = useGetResponsablesQuery();
  const [creerResponsable] = useCreerResponsableMutation();
  const [modifierResponsable] = useModifierResponsableMutation();
  const [supprimerResponsable] = useSupprimerResponsableMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [voirMdp, setVoirMdp] = useState(false);
  const [succes, setSucces] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    tarifJournalier: "",
  });
  const { data: chantiers = [] } = useGetChantiersQuery();
  const [erreur, setErreur] = useState("");

  // Filtrer par recherche
  const filteredResponsables = responsables.filter((r) =>
    `${r.nom} ${r.prenom} ${r.email}`
      .toLowerCase()
      .includes(recherche.toLowerCase()),
  );
  // Trouver le chantier assigné à un responsable
  const getChantierAssigne = (responsableId) => {
    const chantier = chantiers.find(
      (c) => c.responsable?._id === responsableId,
    );
    return chantier ? chantier.nom : null;
  };

  const openCreate = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      tarifJournalier: "",
    });
    setEditMode(false);
    setSelectedId(null);
    setErreur("");
    setModalOpen(true);
    setVoirMdp(false);
  };

  const openEdit = (r) => {
    setForm({
      nom: r.nom,
      prenom: r.prenom,
      email: r.email,
      motDePasse: "",
      tarifJournalier: r.tarifJournalier || "",
    });
    setEditMode(true);
    setSelectedId(r._id);
    setErreur("");
    setModalOpen(true);
    setVoirMdp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      if (editMode) {
        const data = {
          id: selectedId,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          tarifJournalier: form.tarifJournalier,
        };
        if (form.motDePasse) data.motDePasse = form.motDePasse;
        await modifierResponsable(data).unwrap();
        setSucces({
          type: "warning",
          message: "Responsable modifié avec succès",
        });
      } else {
        await creerResponsable(form).unwrap();
        setSucces({ type: "success", message: "Responsable créé avec succès" });
      }
      setModalOpen(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerResponsable(id).unwrap();
      setDeleteConfirm(null);
      setSucces({
        type: "delete",
        message: "Responsable supprimé avec succès",
      });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setErreur(null), 3000);
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
      {/* Message de succès */}
      <Alert type={succes?.type} message={succes?.message} />

      {/* Message d'erreur global */}
      {!modalOpen && <Alert type="error" message={erreur} />}
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Responsables</h2>
          <div className="flex items-center gap-3">
            {/* Recherche */}
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width={16}
                height={16}
                color="currentColor"
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-56"
                style={{ outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Bouton créer */}
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
              Créer compte
            </button>
          </div>
        </div>

        {/* Tableau */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Nom
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Prénom
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Email
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Chantier Assigné
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredResponsables.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  Aucun responsable trouvé
                </td>
              </tr>
            ) : (
              filteredResponsables.map((r) => (
                <tr
                  key={r._id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  style={{ transition: "background-color 0.1s" }}
                >
                  <td className="py-3.5 px-4 text-sm text-gray-800 font-medium">
                    {r.nom}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-gray-600">
                    {r.prenom}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-gray-500">
                    {r.email}
                  </td>
                  <td className="py-3.5 px-4">
                    {getChantierAssigne(r._id) ? (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: "#dc55391a",
                          color: "#dc5539",
                        }}
                      >
                        {getChantierAssigne(r._id)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Non assigné</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Modifier */}
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                        style={{ transition: "all 0.15s" }}
                      >
                        <EditIcon width={16} height={16} color="currentColor" />
                      </button>
                      {/* Supprimer */}
                      <button
                        onClick={() => setDeleteConfirm(r._id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Créer/Modifier */}
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
              {editMode ? "Modifier le responsable" : "Créer un responsable"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
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
                  placeholder="0.00"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe{" "}
                  {editMode && (
                    <span className="text-gray-400 font-normal">
                      (laisser vide pour ne pas changer)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={voirMdp ? "text" : "password"}
                    value={form.motDePasse}
                    onChange={(e) =>
                      setForm({ ...form, motDePasse: e.target.value })
                    }
                    required={!editMode}
                    placeholder={editMode ? "••••••••" : ""}
                    className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                  <button
                    type="button"
                    onClick={() => setVoirMdp(!voirMdp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ transition: "color 0.15s" }}
                  >
                    {voirMdp ? (
                      <EyeOffIcon width={18} height={18} color="currentColor" />
                    ) : (
                      <EyeIcon width={18} height={18} color="currentColor" />
                    )}
                  </button>
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
        title="Supprimer le responsable ?"
        message="Cette action est irréversible."
      />
    </div>
  );
};

export default Responsables;
