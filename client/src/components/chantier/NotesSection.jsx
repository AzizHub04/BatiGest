import { useEffect, useState } from "react";
import {
  useGetNotesByChantierQuery,
  useCreerNoteMutation,
  useModifierNoteMutation,
  useSupprimerNoteMutation,
} from "../../services/noteApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";
import socket from "../../services/socket";
import { CalendarIcon, EditIcon, TrashIcon, PlusIcon } from "../icons/SvgIcons";

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  return new Date(dateValue)
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

const NotesSection = ({
  chantierId,
  showPageHeader = false,
  pageTitle = "Notes du chantier",
  pageSubtitle = "Journal de bord et notes d'\u00e9quipe",
}) => {
  const { data: notes = [], refetch: refetchNotes } =
    useGetNotesByChantierQuery(chantierId, { skip: !chantierId });
  const [creerNote] = useCreerNoteMutation();
  const [modifierNote] = useModifierNoteMutation();
  const [supprimerNote] = useSupprimerNoteMutation();

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitre, setEditTitre] = useState("");
  const [editContenu, setEditContenu] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [succes, setSucces] = useState(null);

  useEffect(() => {
    if (!chantierId) return;

    socket.emit("join-chantier", chantierId);
    socket.on("note-added", refetchNotes);
    socket.on("note-updated", refetchNotes);
    socket.on("note-deleted", refetchNotes);

    return () => {
      socket.off("note-added", refetchNotes);
      socket.off("note-updated", refetchNotes);
      socket.off("note-deleted", refetchNotes);
    };
  }, [chantierId, refetchNotes]);

  const pushSuccess = (type, message) => {
    setSucces({ type, message });
    setTimeout(() => setSucces(null), 3000);
  };

  const handleAdd = async () => {
    if (!titre.trim() || !contenu.trim()) return;
    try {
      await creerNote({ titre, contenu, chantier: chantierId }).unwrap();
      setTitre("");
      setContenu("");
      pushSuccess("success", "Note ajout\u00e9e avec succ\u00e8s");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (id) => {
    if (!editTitre.trim() || !editContenu.trim()) return;
    try {
      await modifierNote({
        id,
        titre: editTitre,
        contenu: editContenu,
      }).unwrap();
      setEditId(null);
      setEditTitre("");
      setEditContenu("");
      pushSuccess("warning", "Note modifi\u00e9e avec succ\u00e8s");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerNote(id).unwrap();
      setDeleteConfirm(null);
      pushSuccess("delete", "Note supprim\u00e9e avec succ\u00e8s");
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

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de la note..."
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3"
          style={{ outline: "none", transition: "border-color 0.15s" }}
          onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
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
            disabled={!titre.trim() || !contenu.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl"
            style={{
              backgroundColor:
                titre.trim() && contenu.trim() ? "#dc5539" : "#f3f4f6",
              color: titre.trim() && contenu.trim() ? "white" : "#9ca3af",
              transition: "all 0.15s",
              cursor:
                titre.trim() && contenu.trim() ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (titre.trim() && contenu.trim())
                e.target.style.backgroundColor = "#c44a30";
            }}
            onMouseLeave={(e) => {
              if (titre.trim() && contenu.trim())
                e.target.style.backgroundColor = "#dc5539";
            }}
          >
            <PlusIcon width={16} height={16} color="currentColor" />
            Ajouter la note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Aucune note pour ce chantier
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon width={14} height={14} color="#dc5539" />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#dc5539" }}
                    >
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditId(note._id);
                        setEditTitre(note.titre);
                        setEditContenu(note.contenu);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                      style={{ transition: "color 0.15s" }}
                    >
                      <EditIcon width={14} height={14} color="currentColor" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(note._id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      style={{ transition: "color 0.15s" }}
                    >
                      <TrashIcon width={14} height={14} color="currentColor" />
                    </button>
                  </div>
                </div>

                {editId === note._id ? (
                  <div>
                    <input
                      type="text"
                      value={editTitre}
                      onChange={(e) => setEditTitre(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2"
                      style={{ outline: "none" }}
                      onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
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
                        onClick={() => handleEdit(note._id)}
                        className="px-3 py-1.5 text-xs text-white rounded-lg"
                        style={{ backgroundColor: "#dc5539" }}
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      {note.titre}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {note.contenu}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {getInitiales(note.auteur)}
                </div>
                <span className="text-xs text-gray-500">
                  {note.auteur?.prenom} {note.auteur?.nom}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDelete
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Supprimer la note ?"
        message="Cette action est irr\u00e9versible."
      />
    </div>
  );
};

export default NotesSection;
