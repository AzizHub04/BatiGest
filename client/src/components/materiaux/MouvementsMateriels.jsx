import { useState } from "react";
import { useGetMaterielsQuery } from "../../services/materielApiSlice";
import {
  useGetMouvementsQuery,
  useCreerMouvementMutation,
  useModifierMouvementMutation,
  useSupprimerMouvementMutation,
} from "../../services/mouvementApiSlice";
import { useGetChantiersQuery } from "../../services/chantierApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";
import { PlusIcon, EditIcon, TrashIcon, ArrowDownIcon, ArrowUpIcon } from "../icons/SvgIcons";

const MouvementsMateriels = () => {
  const { data: materiels = [] } = useGetMaterielsQuery();
  const { data: chantiers = [] } = useGetChantiersQuery();

  const [filtreMateriel, setFiltreMateriel] = useState("");
  const [filtreChantier, setFiltreChantier] = useState("");

  const queryParams = {};
  if (filtreMateriel) queryParams.materielId = filtreMateriel;
  if (filtreChantier) queryParams.chantierId = filtreChantier;

  const { data: mouvements = [] } = useGetMouvementsQuery(queryParams);
  const [creerMouvement] = useCreerMouvementMutation();
  const [supprimerMouvement] = useSupprimerMouvementMutation();
  const [modifierMouvement] = useModifierMouvementMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState({
    materielId: "",
    chantierId: "",
    quantite: "",
    typeMouvement: "Sortie",
    dateMouvement: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const openCreate = () => {
    setForm({
      materielId: "",
      chantierId: "",
      quantite: "",
      typeMouvement: "Sortie",
      dateMouvement: new Date().toISOString().split("T")[0],
      note: "",
    });
    setEditMode(false);
    setEditId(null);
    setErreur("");
    setModalOpen(true);
  };
  const openEdit = (mv) => {
    setForm({
      materielId: mv.materiel?._id || "",
      chantierId: mv.chantier?._id || "",
      quantite: mv.quantite,
      typeMouvement: mv.typeMouvement,
      dateMouvement: mv.dateMouvement || "",
      note: mv.note || "",
    });
    setEditMode(true);
    setEditId(mv._id);
    setErreur("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      if (editMode) {
        await modifierMouvement({
          id: editId,
          ...form,
          quantite: Number(form.quantite),
        }).unwrap();
        setSucces({
          type: "warning",
          message: "Mouvement modifié avec succès",
        });
      } else {
        await creerMouvement({
          ...form,
          quantite: Number(form.quantite),
        }).unwrap();
        setSucces({
          type: "success",
          message: "Mouvement enregistré avec succès",
        });
      }
      setModalOpen(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerMouvement(id).unwrap();
      setDeleteConfirm(null);
      setSucces({
        type: "delete",
        message: "Mouvement annulé — stock restauré",
      });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Matériel sélectionné dans le modal (pour afficher stock dispo)
  const materielSelectionne = materiels.find((m) => m._id === form.materielId);

  return (
    <div>
      <Alert type={succes?.type} message={succes?.message} />

      {/* Filtres + bouton */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <select
            value={filtreMateriel}
            onChange={(e) => setFiltreMateriel(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
            style={{ outline: "none", minWidth: 180 }}
          >
            <option value="">Tous les matériaux</option>
            {materiels.map((m) => (
              <option key={m._id} value={m._id}>
                {m.nom} ({m.quantiteStock} {m.unite})
              </option>
            ))}
          </select>
          <select
            value={filtreChantier}
            onChange={(e) => setFiltreChantier(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
            style={{ outline: "none", minWidth: 180 }}
          >
            <option value="">Tous les chantiers</option>
            {chantiers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nom}
              </option>
            ))}
          </select>
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
          Nouveau mouvement
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Matériel</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Quantité</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Chantier</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Note</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mouvements.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-sm text-gray-400">Aucun mouvement trouvé</td></tr>
            ) : (
              mouvements.map((mv) => {
                const isSortie = mv.typeMouvement === "Sortie";
                return (
                  <tr key={mv._id} className="border-b border-gray-50 hover:bg-gray-50" style={{ transition: "background-color 0.1s" }}>
                    <td className="px-5 py-3 text-sm text-gray-700">{formatDate(mv.dateMouvement)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 w-fit" style={{ backgroundColor: isSortie ? "#fee2e2" : "#dcfce7", color: isSortie ? "#dc2626" : "#16a34a" }}>
                        {isSortie ? <ArrowDownIcon width={12} height={12} color="currentColor" /> : <ArrowUpIcon width={12} height={12} color="currentColor" />}
                        {mv.typeMouvement}
                      </span>
                    </td>
                    <td className="px-5 py-3"><span className="text-sm font-medium text-gray-800">{mv.materiel?.nom}</span></td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold" style={{ color: isSortie ? "#dc2626" : "#16a34a" }}>
                        {isSortie ? "-" : "+"}{mv.quantite} {mv.materiel?.unite}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{mv.chantier?.nom || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{mv.note || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        <button onClick={() => openEdit(mv)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50" style={{ transition: "all 0.15s" }}>
                          <EditIcon width={16} height={16} color="currentColor" />
                        </button>
                        <button onClick={() => setDeleteConfirm(mv._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" style={{ transition: "all 0.15s" }}>
                          <TrashIcon width={16} height={16} color="currentColor" />
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
      <div className="block sm:hidden space-y-3">
        {mouvements.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">Aucun mouvement trouvé</p>
        ) : (
          mouvements.map((mv) => {
            const isSortie = mv.typeMouvement === "Sortie";
            return (
              <div key={mv._id} className="bg-white border border-gray-100 rounded-xl p-4">
                {/* Header: matériel + type badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{mv.materiel?.nom}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(mv.dateMouvement)}</p>
                  </div>
                  <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: isSortie ? "#fee2e2" : "#dcfce7", color: isSortie ? "#dc2626" : "#16a34a" }}>
                    {isSortie ? <ArrowDownIcon width={10} height={10} color="currentColor" /> : <ArrowUpIcon width={10} height={10} color="currentColor" />}
                    {mv.typeMouvement}
                  </span>
                </div>
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-gray-400">Quantité</p>
                    <p className="font-bold mt-0.5" style={{ color: isSortie ? "#dc2626" : "#16a34a" }}>
                      {isSortie ? "-" : "+"}{mv.quantite} {mv.materiel?.unite}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Chantier</p>
                    <p className="text-gray-700 font-medium mt-0.5">{mv.chantier?.nom || "—"}</p>
                  </div>
                  {mv.note && (
                    <div className="col-span-2">
                      <p className="text-gray-400">Note</p>
                      <p className="text-gray-600 mt-0.5">{mv.note}</p>
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(mv)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">
                    <EditIcon width={12} height={12} color="currentColor" /> Modifier
                  </button>
                  <button onClick={() => setDeleteConfirm(mv._id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg">
                    <TrashIcon width={12} height={12} color="currentColor" /> Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal nouveau mouvement */}
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
              {editMode ? "Modifier le mouvement" : "Nouveau mouvement"}
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
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de mouvement
                </label>
                <div className="flex gap-3">
                  {["Sortie", "Entrée"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, typeMouvement: t })}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2"
                      style={{
                        borderColor:
                          form.typeMouvement === t
                            ? t === "Sortie"
                              ? "#dc2626"
                              : "#16a34a"
                            : "#e5e7eb",
                        backgroundColor:
                          form.typeMouvement === t
                            ? t === "Sortie"
                              ? "#fee2e2"
                              : "#dcfce7"
                            : "white",
                        color:
                          form.typeMouvement === t
                            ? t === "Sortie"
                              ? "#dc2626"
                              : "#16a34a"
                            : "#6b7280",
                        transition: "all 0.15s",
                      }}
                    >
                      {t === "Sortie"
                        ? "Sortie (vers chantier)"
                        : "Entrée (retour stock)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matériel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matériel
                </label>
                <select
                  value={form.materielId}
                  onChange={(e) =>
                    setForm({ ...form, materielId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                >
                  <option value="">— Sélectionner —</option>
                  {materiels.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.nom} (Stock: {m.quantiteStock} | Dehors:{" "}
                      {m.quantiteDehors} {m.unite})
                    </option>
                  ))}
                </select>
                {materielSelectionne && (
                  <p className="text-xs text-gray-400 mt-1">
                    Disponible :{" "}
                    {form.typeMouvement === "Sortie"
                      ? materielSelectionne.quantiteStock
                      : materielSelectionne.quantiteDehors}{" "}
                    {materielSelectionne.unite}
                  </p>
                )}
              </div>

              {/* Chantier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chantier
                </label>
                <select
                  value={form.chantierId}
                  onChange={(e) =>
                    setForm({ ...form, chantierId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                >
                  <option value="">— Sélectionner —</option>
                  {chantiers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantité + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={form.quantite}
                    onChange={(e) =>
                      setForm({ ...form, quantite: e.target.value })
                    }
                    required
                    min="1"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.dateMouvement}
                    onChange={(e) =>
                      setForm({ ...form, dateMouvement: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optionnel)
                </label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Ex: Livraison fournisseur..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
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
                  {editMode ? "Modifier" : "Enregistrer"}
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
        title="Annuler ce mouvement ?"
        message="Le stock sera restauré à sa valeur précédente."
      />
    </div>
  );
};

export default MouvementsMateriels;
