import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetNotesByChantierQuery,
  useCreerNoteMutation,
  useModifierNoteMutation,
  useSupprimerNoteMutation,
} from "../../services/noteApiSlice";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";
import SearchInput from "../SearchInput";
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
  const { utilisateur } = useSelector((state) => state.auth);
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

  // Search + sort + date filter
  const [recherche, setRecherche] = useState("");
  const [triDesc, setTriDesc] = useState(true); // newest first
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail modal
  const [noteDetail, setNoteDetail] = useState(null);

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

  // Keep detail in sync when notes refresh
  useEffect(() => {
    if (noteDetail) {
      const updated = notes.find((n) => n._id === noteDetail._id);
      if (updated) setNoteDetail(updated);
    }
  }, [notes]); // eslint-disable-line

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
      if (noteDetail?._id === id) setNoteDetail(null);
      pushSuccess("delete", "Note supprim\u00e9e avec succ\u00e8s");
    } catch (err) {
      console.error(err);
    }
  };

  const currentUserId = utilisateur?.id || utilisateur?._id;
  const isAuteur = (note) =>
    currentUserId &&
    note.auteur?._id &&
    String(note.auteur._id) === String(currentUserId);

  const notesFiltrees = useMemo(() => {
    let arr = [...notes];
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      arr = arr.filter(
        (n) =>
          (n.titre || "").toLowerCase().includes(q) ||
          (n.contenu || "").toLowerCase().includes(q),
      );
    }
    if (dateFrom) {
      arr = arr.filter((n) => (n.createdAt || "").substring(0, 10) >= dateFrom);
    }
    if (dateTo) {
      arr = arr.filter((n) => (n.createdAt || "").substring(0, 10) <= dateTo);
    }
    arr.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      return triDesc ? db - da : da - db;
    });
    return arr;
  }, [notes, recherche, triDesc, dateFrom, dateTo]);

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

      {/* Add note form */}
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

      {/* Search + date filter + sort */}
      {notes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une note..."
            className="flex-1 min-w-45"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              De
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              style={{ outline: "none", transition: "border-color 0.15s" }}
              onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              À
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
              style={{ outline: "none", transition: "border-color 0.15s" }}
              onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
          <button
            onClick={() => setTriDesc(!triDesc)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap"
            style={{ transition: "background-color 0.15s" }}
          >
            <span>{triDesc ? "↓" : "↑"}</span>
            <span>Date</span>
          </button>
          {(recherche || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setRecherche("");
                setDateFrom("");
                setDateTo("");
              }}
              className="px-3 py-2 text-xs font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100"
              style={{ transition: "background-color 0.15s" }}
            >
              Effacer
            </button>
          )}
        </div>
      )}

      {notesFiltrees.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          {recherche
            ? "Aucune note trouv\u00e9e"
            : "Aucune note pour ce chantier"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notesFiltrees.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-between cursor-pointer"
              style={{ transition: "border-color 0.15s, box-shadow 0.15s" }}
              onClick={() => setNoteDetail(note)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#dc553940";
                e.currentTarget.style.boxShadow = "0 2px 12px 0 #dc55391a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f3f4f6";
                e.currentTarget.style.boxShadow = "none";
              }}
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
                  {isAuteur(note) && (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setNoteDetail(note);
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
                        <TrashIcon
                          width={14}
                          height={14}
                          color="currentColor"
                        />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                  {note.titre}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {note.contenu}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {getInitiales(note.auteur)}
                </div>
                <span className="text-xs text-gray-500">
                  {note.auteur?.prenom && note.auteur?.nom
                    ? `${note.auteur.prenom} ${note.auteur.nom}`
                    : "Auteur inconnu"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Edit modal */}
      {noteDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setNoteDetail(null);
            setEditId(null);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {editId === noteDetail._id ? (
              /* ── Edit form inside modal ── */
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Modifier la note
                </h3>
                <input
                  type="text"
                  value={editTitre}
                  onChange={(e) => setEditTitre(e.target.value)}
                  placeholder="Titre de la note..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <textarea
                  value={editContenu}
                  onChange={(e) => setEditContenu(e.target.value)}
                  rows="7"
                  placeholder="Contenu de la note..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none mb-4"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditId(null)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                    style={{ transition: "background-color 0.15s" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleEdit(noteDetail._id)}
                    className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#dc5539" }}
                  >
                    Sauvegarder
                  </button>
                </div>
              </>
            ) : (
              /* ── Detail view ── */
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon width={14} height={14} color="#dc5539" />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#dc5539" }}
                    >
                      {formatDate(noteDetail.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAuteur(noteDetail) && (
                      <>
                        <button
                          onClick={() => {
                            setEditId(noteDetail._id);
                            setEditTitre(noteDetail.titre);
                            setEditContenu(noteDetail.contenu);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg"
                          style={{ transition: "opacity 0.15s" }}
                        >
                          <EditIcon
                            width={12}
                            height={12}
                            color="currentColor"
                          />
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(noteDetail._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg"
                          style={{ transition: "opacity 0.15s" }}
                        >
                          <TrashIcon
                            width={12}
                            height={12}
                            color="currentColor"
                          />
                          Supprimer
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setNoteDetail(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 text-sm"
                      style={{ transition: "all 0.15s" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  {noteDetail.titre}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {noteDetail.contenu}
                </p>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: "#dc5539" }}
                  >
                    {getInitiales(noteDetail.auteur)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {noteDetail.auteur?.prenom && noteDetail.auteur?.nom
                      ? `${noteDetail.auteur.prenom} ${noteDetail.auteur.nom}`
                      : "Auteur inconnu"}
                  </span>
                </div>
              </>
            )}
          </div>
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
