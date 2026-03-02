import { useEffect, useState } from "react";
import {
  useGetTravauxByChantierQuery,
  useCreerTravailMutation,
  useModifierTravailMutation,
  useSupprimerTravailMutation,
} from "../../services/travailApiSlice";
import TachesList from "../TachesList";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";
import socket from "../../services/socket";

const TRAVAIL_ETATS = [
  "Non commenc\u00e9",
  "En cours",
  "Termin\u00e9",
];

const travailEtatStyle = (etat) => {
  switch (etat) {
    case "Termin\u00e9":
      return { bg: "#dcfce7", color: "#16a34a" };
    case "En cours":
      return { bg: "#dbeafe", color: "#2563eb" };
    default:
      return { bg: "#f3f4f6", color: "#6b7280" };
  }
};

const TravauxSection = ({
  chantierId,
  showPageHeader = false,
  pageTitle = "Travaux & T\u00e2ches",
  pageSubtitle = "G\u00e9rez l'avancement des travaux du chantier",
  panelAddLabel = "Nouveau travail",
}) => {
  const { data: travaux = [], refetch: refetchTravaux } =
    useGetTravauxByChantierQuery(chantierId, { skip: !chantierId });
  const [creerTravail] = useCreerTravailMutation();
  const [modifierTravail] = useModifierTravailMutation();
  const [supprimerTravail] = useSupprimerTravailMutation();

  const [travailOpen, setTravailOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState({ titre: "", description: "" });

  useEffect(() => {
    if (!chantierId) return;

    socket.emit("join-chantier", chantierId);
    socket.on("travail-updated", refetchTravaux);
    socket.on("tache-updated", refetchTravaux);

    return () => {
      socket.off("travail-updated", refetchTravaux);
      socket.off("tache-updated", refetchTravaux);
    };
  }, [chantierId, refetchTravaux]);

  const openCreate = () => {
    setForm({ titre: "", description: "" });
    setEditMode(false);
    setSelectedId(null);
    setErreur("");
    setModalOpen(true);
  };

  const openEdit = (travail) => {
    setForm({ titre: travail.titre, description: travail.description || "" });
    setEditMode(true);
    setSelectedId(travail._id);
    setErreur("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setErreur("");
  };

  const pushSuccess = (type, message) => {
    setSucces({ type, message });
    setTimeout(() => setSucces(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      if (editMode) {
        await modifierTravail({ id: selectedId, ...form }).unwrap();
        pushSuccess("warning", "Travail modifi\u00e9 avec succ\u00e8s");
      } else {
        await creerTravail({ ...form, chantier: chantierId }).unwrap();
        pushSuccess("success", "Travail cr\u00e9\u00e9 avec succ\u00e8s");
      }
      closeModal();
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerTravail(id).unwrap();
      setDeleteConfirm(null);
      pushSuccess("delete", "Travail supprim\u00e9 avec succ\u00e8s");
    } catch (err) {
      console.error(err);
    }
  };

  if (!chantierId) return null;

  return (
    <div>
      {showPageHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
          <p className="text-sm text-gray-400 mt-1">{pageSubtitle}</p>
        </div>
      )}

      <Alert type={succes?.type} message={succes?.message} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Travaux ({travaux.length})
          </h3>
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
            {panelAddLabel}
          </button>
        </div>

        {travaux.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Aucun travail pour ce chantier
          </p>
        ) : (
          <div className="space-y-3">
            {travaux.map((t) => {
              const etatStyle = travailEtatStyle(t.etat);
              const isOpen = travailOpen === t._id;
              return (
                <div
                  key={t._id}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    style={{ transition: "background-color 0.1s" }}
                    onClick={() => setTravailOpen(isOpen ? null : t._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#dc55391a" }}
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          stroke="#dc5539"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M9 3v18M3 9h18" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {t.titre}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {t.nbTaches > 0 ? (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: etatStyle.bg,
                                color: etatStyle.color,
                              }}
                            >
                              {t.etat}
                            </span>
                          ) : (
                            <select
                              value={t.etat}
                              onChange={async (e) => {
                                e.stopPropagation();
                                try {
                                  await modifierTravail({
                                    id: t._id,
                                    etat: e.target.value,
                                  }).unwrap();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer"
                              style={{
                                backgroundColor: etatStyle.bg,
                                color: etatStyle.color,
                                outline: "none",
                              }}
                            >
                              {TRAVAIL_ETATS.map((etat) => (
                                <option key={etat} value={etat}>
                                  {etat}
                                </option>
                              ))}
                            </select>
                          )}
                          <span className="text-xs text-gray-400">
                            {t.nbTaches > 0
                              ? `${t.nbTaches} t\u00e2ches`
                              : "Aucune t\u00e2che"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {t.nbTaches > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${t.avancement}%`,
                                backgroundColor: "#dc5539",
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {t.avancement}%
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(t);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                        style={{ transition: "all 0.15s" }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(t._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        style={{ transition: "all 0.15s" }}
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
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{
                          transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                          transition: "transform 0.15s",
                        }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                  {isOpen && <TachesList travailId={t._id} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Modifier le travail" : "Nouveau travail"}
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
                  rows="3"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
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
                  {editMode ? "Modifier" : "Cr\u00e9er"}
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
        title="Supprimer le travail ?"
        message="Toutes les t\u00e2ches associ\u00e9es seront supprim\u00e9es."
      />
    </div>
  );
};

export default TravauxSection;
