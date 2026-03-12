import { useEffect, useState, useMemo } from "react";
import {
  useGetTravauxByChantierQuery,
  useCreerTravailMutation,
  useModifierTravailMutation,
  useSupprimerTravailMutation,
} from "../../services/travailApiSlice";
import TachesList from "../TachesList";
import Alert from "../Alert";
import ConfirmDelete from "../ConfirmDelete";
import SearchInput from "../SearchInput";
import {
  PlusIcon,
  GridIcon,
  EditIcon,
  TrashIcon,
  ChevronRightIcon,
} from "../icons/SvgIcons";
import socket from "../../services/socket";
import BadgeSelect from "../BadgeSelect";

const TRAVAIL_ETATS = ["Non commenc\u00e9", "En cours", "Termin\u00e9"];

const TRAVAIL_ETAT_OPTIONS = [
  { value: "Non commencé", bg: "#f3f4f6", color: "#6b7280" },
  { value: "En cours",     bg: "#dbeafe", color: "#2563eb" },
  { value: "Terminé",      bg: "#dcfce7", color: "#16a34a" },
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

  // Search + sort + date filter
  const [recherche, setRecherche] = useState("");
  const [triDesc, setTriDesc] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const travauxFiltres = useMemo(() => {
    let arr = [...travaux];
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      arr = arr.filter(
        (t) =>
          (t.titre || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q),
      );
    }
    if (dateFrom) {
      arr = arr.filter((t) => (t.createdAt || "").substring(0, 10) >= dateFrom);
    }
    if (dateTo) {
      arr = arr.filter((t) => (t.createdAt || "").substring(0, 10) <= dateTo);
    }
    arr.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      return triDesc ? db - da : da - db;
    });
    return arr;
  }, [travaux, recherche, triDesc, dateFrom, dateTo]);

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
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">
            Travaux ({travaux.length})
          </h3>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium"
            style={{
              backgroundColor: "var(--color-brand)",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--color-brand-dark)")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-brand)")}
          >
            <PlusIcon width={16} height={16} color="currentColor" />
            {panelAddLabel}
          </button>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <SearchInput
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un travail..."
            className="flex-1 min-w-45"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">De</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              style={{ outline: "none", transition: "border-color 0.15s" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">À</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              style={{ outline: "none", transition: "border-color 0.15s" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
          <button
            onClick={() => setTriDesc(!triDesc)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white hover:bg-gray-50 whitespace-nowrap"
            style={{ transition: "background-color 0.15s" }}
          >
            <span>{triDesc ? "↓" : "↑"}</span>
            <span>Date</span>
          </button>
          {(recherche || dateFrom || dateTo) && (
            <button
              onClick={() => { setRecherche(""); setDateFrom(""); setDateTo(""); }}
              className="px-3 py-2 text-xs font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100"
              style={{ transition: "background-color 0.15s" }}
            >
              Effacer
            </button>
          )}
        </div>

        {travaux.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Aucun travail pour ce chantier
          </p>
        ) : travauxFiltres.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Aucun travail trouv\u00e9
          </p>
        ) : (
          <div className="space-y-3">
            {travauxFiltres.map((t) => {
              const etatStyle = travailEtatStyle(t.etat);
              const isOpen = travailOpen === t._id;
              return (
                <div
                  key={t._id}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  {/* ── Desktop row (hidden on mobile) ── */}
                  <div
                    className="hidden sm:flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    style={{ transition: "background-color 0.1s" }}
                    onClick={() => setTravailOpen(isOpen ? null : t._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-brand-subtle)" }}
                      >
                        <GridIcon width={18} height={18} color="var(--color-brand)" />
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
                            <BadgeSelect
                              value={t.etat}
                              onChange={async (val) => {
                                try {
                                  await modifierTravail({ id: t._id, etat: val }).unwrap();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              options={TRAVAIL_ETAT_OPTIONS}
                              stopPropagation
                            />
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
                                backgroundColor: "var(--color-brand)",
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
                        <EditIcon width={14} height={14} color="currentColor" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(t._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        style={{ transition: "all 0.15s" }}
                      >
                        <TrashIcon
                          width={14}
                          height={14}
                          color="currentColor"
                        />
                      </button>
                      <span
                        style={{
                          display: "inline-flex",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                          transition: "transform 0.15s",
                        }}
                      >
                        <ChevronRightIcon />
                      </span>
                    </div>
                  </div>

                  {/* ── Mobile card (hidden on desktop) ── */}
                  <div className="block sm:hidden">
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setTravailOpen(isOpen ? null : t._id)}
                    >
                      {/* Card header: icon + title + status badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: "#dc55391a" }}
                          >
                            <GridIcon width={18} height={18} color="#dc5539" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 leading-tight">
                            {t.titre}
                          </span>
                        </div>
                        {t.nbTaches > 0 ? (
                          <span
                            className="shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold"
                            style={{
                              backgroundColor: etatStyle.bg,
                              color: etatStyle.color,
                            }}
                          >
                            {t.etat}
                          </span>
                        ) : (
                          <BadgeSelect
                            value={t.etat}
                            onChange={async (val) => {
                              try {
                                await modifierTravail({ id: t._id, etat: val }).unwrap();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            options={TRAVAIL_ETAT_OPTIONS}
                            stopPropagation
                          />
                        )}
                      </div>

                      {/* Progress + tâches count */}
                      <div className="ml-12 space-y-2">
                        {t.nbTaches > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">
                                {t.nbTaches} t\u00e2ches
                              </span>
                              <span className="text-xs font-semibold text-gray-600">
                                {t.avancement}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${t.avancement}%`,
                                  backgroundColor: "#dc5539",
                                  transition: "width 0.3s",
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {t.nbTaches === 0 && (
                          <span className="text-xs text-gray-400">
                            Aucune t\u00e2che
                          </span>
                        )}
                      </div>

                      {/* Card footer: actions + chevron */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(t);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg"
                            style={{ transition: "opacity 0.15s" }}
                          >
                            <EditIcon width={12} height={12} color="currentColor" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(t._id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg"
                            style={{ transition: "opacity 0.15s" }}
                          >
                            <TrashIcon width={12} height={12} color="currentColor" />
                            Supprimer
                          </button>
                        </div>
                        <span
                          className="text-gray-400 text-xs font-medium flex items-center gap-1"
                          style={{
                            transition: "transform 0.15s",
                          }}
                        >
                          T\u00e2ches
                          <span
                            style={{
                              display: "inline-flex",
                              transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                              transition: "transform 0.15s",
                            }}
                          >
                            <ChevronRightIcon />
                          </span>
                        </span>
                      </div>
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
                style={{ backgroundColor: "var(--color-brand-subtle)", color: "var(--color-brand)" }}
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
                  placeholder="Ex: Maçonnerie..."
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
                  placeholder="Description du travail..."
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
                    backgroundColor: "var(--color-brand)",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "var(--color-brand-dark)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "var(--color-brand)")
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
