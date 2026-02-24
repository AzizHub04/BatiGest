import { useState } from "react";
import {
  useGetTachesByTravailQuery,
  useCreerTacheMutation,
  useModifierTacheMutation,
  useChangerStatutMutation,
  useSupprimerTacheMutation,
} from "../services/tacheApiSlice";
import Alert from "../components/Alert";

const TachesList = ({ travailId }) => {
  const { data: taches = [] } = useGetTachesByTravailQuery(travailId);
  const [creerTache] = useCreerTacheMutation();
  const [modifierTache] = useModifierTacheMutation();
  const [changerStatut] = useChangerStatutMutation();
  const [supprimerTache] = useSupprimerTacheMutation();
  const [succes, setSucces] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    priorite: "Moyenne",
  });

  const prioriteStyle = (p) => {
    switch (p) {
      case "Haute":
        return { bg: "#fee2e2", color: "#dc2626" };
      case "Moyenne":
        return { bg: "#fef3c7", color: "#d97706" };
      case "Basse":
        return { bg: "#dcfce7", color: "#16a34a" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  const statutStyle = (s) => {
    switch (s) {
      case "Terminé":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "En cours":
        return { bg: "#dbeafe", color: "#2563eb" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  const openCreate = () => {
    setForm({ titre: "", description: "", priorite: "Moyenne" });
    setEditMode(false);
    setSelectedId(null);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setForm({
      titre: t.titre,
      description: t.description || "",
      priorite: t.priorite,
    });
    setEditMode(true);
    setSelectedId(t._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await modifierTache({ id: selectedId, ...form }).unwrap();
        setSucces({ type: "warning", message: "Tâche modifiée" });
        setTimeout(() => setSucces(null), 3000);
      } else {
        await creerTache({ ...form, travail: travailId }).unwrap();
        setSucces({ type: "success", message: "Tâche créée" });
        setTimeout(() => setSucces(null), 3000);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="ml-6 mt-2 mb-4">
      <Alert type={succes?.type} message={succes?.message} />
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase">
          Tâches ({taches.length})
        </span>
        <button
          onClick={openCreate}
          className="text-xs font-medium"
          style={{ color: "#dc5539" }}
        >
          + Ajouter
        </button>
      </div>

      {taches.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Aucune tâche</p>
      ) : (
        <div className="space-y-1.5">
          {taches.map((t) => {
            const ps = prioriteStyle(t.priorite);
            const ss = statutStyle(t.statut);
            return (
              <div
                key={t._id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                style={{ transition: "background-color 0.1s" }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <select
                    value={t.statut}
                    onChange={async (e) => {
                      try {
                        await changerStatut({
                          id: t._id,
                          statut: e.target.value,
                        }).unwrap();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium border-0 cursor-pointer"
                    style={{
                      backgroundColor: ss.bg,
                      color: ss.color,
                      outline: "none",
                    }}
                  >
                    <option value="Non commencé">Non commencé</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                  <span className="text-sm text-gray-700">{t.titre}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: ps.bg, color: ps.color }}
                  >
                    {t.priorite}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1 text-gray-400 hover:text-blue-500"
                    style={{ transition: "color 0.15s" }}
                  >
                    <svg
                      width="14"
                      height="14"
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
                    onClick={async () => {
                      await supprimerTache(t._id).unwrap();
                      setSucces({ type: "delete", message: "Tâche supprimée" });
                      setTimeout(() => setSucces(null), 3000);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    style={{ transition: "color 0.15s" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tâche */}
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
              {editMode ? "Modifier la tâche" : "Ajouter une tâche"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="2"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={form.priorite}
                  onChange={(e) =>
                    setForm({ ...form, priorite: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                >
                  <option value="Haute">Haute</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Basse">Basse</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {editMode ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TachesList;
