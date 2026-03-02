import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetChantierByResponsableQuery } from "../../services/chantierApiSlice";
import {
  useGetNotesByChantierQuery,
  useCreerNoteMutation,
  useModifierNoteMutation,
  useSupprimerNoteMutation,
} from "../../services/noteApiSlice";
import Alert from "../../components/Alert";
import ConfirmDelete from "../../components/ConfirmDelete";
import socket from "../../services/socket";

const NotesChantier = () => {
  const { utilisateur } = useSelector((state) => state.auth);
  const { data: chantier } = useGetChantierByResponsableQuery(utilisateur?.id);
  const { data: notes = [], refetch: refetchNotes } =
    useGetNotesByChantierQuery(chantier?._id, { skip: !chantier });
  const [creerNote] = useCreerNoteMutation();
  const [modifierNote] = useModifierNoteMutation();
  const [supprimerNote] = useSupprimerNoteMutation();

  const [contenu, setContenu] = useState("");
  const [editId, setEditId] = useState(null);
  const [editContenu, setEditContenu] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);

  // Socket.io — temps réel
  useEffect(() => {
    if (chantier) {
      socket.emit("join-chantier", chantier._id);

      socket.on("note-added", () => refetchNotes());
      socket.on("note-updated", () => refetchNotes());
      socket.on("note-deleted", () => refetchNotes());
    }

    return () => {
      socket.off("note-added");
      socket.off("note-updated");
      socket.off("note-deleted");
    };
  }, [chantier, refetchNotes]);

  const handleAdd = async () => {
    if (!contenu.trim()) return;
    try {
      await creerNote({ contenu, chantier: chantier._id }).unwrap();
      setContenu("");
      setSucces({ type: "success", message: "Note ajoutée avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (id) => {
    if (!editContenu.trim()) return;
    try {
      await modifierNote({ id, contenu: editContenu }).unwrap();
      setEditId(null);
      setEditContenu("");
      setSucces({ type: "warning", message: "Note modifiée avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerNote(id).unwrap();
      setDeleteConfirm(null);
      setSucces({ type: "delete", message: "Note supprimée avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d)
      .toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  };

  const getInitiales = (auteur) => {
    if (!auteur) return "??";
    return `${auteur.prenom?.[0] || ""}${auteur.nom?.[0] || ""}`.toUpperCase();
  };

  if (!chantier) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg font-medium">
          Aucun chantier assigné
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Contactez votre administrateur.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notes du chantier</h2>
        <p className="text-sm text-gray-400 mt-1">
          Journal de bord et notes d'équipe
        </p>
      </div>

      <Alert type={succes?.type} message={succes?.message} />

      {/* Zone de saisie */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Rédiger une nouvelle note..."
          rows="4"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none"
          style={{ outline: "none", transition: "border-color 0.15s" }}
          onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleAdd}
            disabled={!contenu.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl"
            style={{
              backgroundColor: contenu.trim() ? "#dc5539" : "#f3f4f6",
              color: contenu.trim() ? "white" : "#9ca3af",
              transition: "all 0.15s",
              cursor: contenu.trim() ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (contenu.trim()) e.target.style.backgroundColor = "#c44a30";
            }}
            onMouseLeave={(e) => {
              if (contenu.trim()) e.target.style.backgroundColor = "#dc5539";
            }}
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
            Ajouter la note
          </button>
        </div>
      </div>

      {/* Liste des notes */}
      {notes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Aucune note pour ce chantier
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-between"
              style={{ transition: "border-color 0.15s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#dc553940")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#f3f4f6")
              }
            >
              <div>
                {/* Header note */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="#dc5539"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#dc5539" }}
                    >
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditId(n._id);
                        setEditContenu(n.contenu);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
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
                      onClick={() => setDeleteConfirm(n._id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
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

                {/* Contenu */}
                {editId === n._id ? (
                  <div>
                    <textarea
                      value={editContenu}
                      onChange={(e) => setEditContenu(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none mb-2"
                      style={{ outline: "none" }}
                      onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditId(null)}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleEdit(n._id)}
                        className="px-3 py-1.5 text-xs text-white rounded-lg"
                        style={{ backgroundColor: "#dc5539" }}
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {n.contenu}
                  </p>
                )}
              </div>

              {/* Footer — Auteur */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {getInitiales(n.auteur)}
                </div>
                <span className="text-xs text-gray-500">
                  {n.auteur?.prenom} {n.auteur?.nom}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDelete
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Supprimer la note ?"
        message="Cette action est irréversible."
      />
    </div>
  );
};

export default NotesChantier;
