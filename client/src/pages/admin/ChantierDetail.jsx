import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetChantierQuery,
  useModifierChantierMutation,
} from "../../services/chantierApiSlice";
import {
  useGetTravauxByChantierQuery,
  useCreerTravailMutation,
  useModifierTravailMutation,
  useSupprimerTravailMutation,
} from "../../services/travailApiSlice";
import TachesList from "../../components/TachesList";
import Alert from "../../components/Alert";
import {
  useGetNotesByChantierQuery,
  useCreerNoteMutation,
  useModifierNoteMutation,
  useSupprimerNoteMutation,
} from "../../services/noteApiSlice";
import {
  useGetCoutsByChantierQuery,
  useCreerCoutMutation,
  useModifierCoutMutation,
  useSupprimerCoutMutation,
} from "../../services/coutApiSlice";
import { useGetResponsablesQuery } from "../../services/responsableApiSlice";
import { useEffect } from "react";
import socket from "../../services/socket";

// Page principale
const ChantierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: chantier,
    isLoading,
    refetch: refetchChantier,
  } = useGetChantierQuery(id);
  const { data: travaux = [], refetch: refetchTravaux } =
    useGetTravauxByChantierQuery(id);
  const { data: notes = [], refetch: refetchNotes } =
    useGetNotesByChantierQuery(id);
  const { data: coutsData, refetch: refetchCouts } =
    useGetCoutsByChantierQuery(id);

  const [creerTravail] = useCreerTravailMutation();
  const [modifierTravail] = useModifierTravailMutation();
  const [supprimerTravail] = useSupprimerTravailMutation();
  const [creerNote] = useCreerNoteMutation();
  const [modifierNote] = useModifierNoteMutation();
  const [supprimerNote] = useSupprimerNoteMutation();
  const [creerCout] = useCreerCoutMutation();
  const [modifierCout] = useModifierCoutMutation();
  const [supprimerCout] = useSupprimerCoutMutation();
  const [modifierChantierMut] = useModifierChantierMutation();
  const { data: responsables = [] } = useGetResponsablesQuery();

  const [onglet, setOnglet] = useState("travaux");
  const [travailOpen, setTravailOpen] = useState(null); // ID du travail ouvert

  // Modals
  const [travailModal, setTravailModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [coutModal, setCoutModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [chantierModal, setChantierModal] = useState(false);
  const [chantierForm, setChantierForm] = useState({
    nom: "",
    localisation: "",
    dateDebut: "",
    dateFinPrevue: "",
    budget: "",
    etat: "",
    responsable: "",
  });

  const [travailForm, setTravailForm] = useState({
    titre: "",
    description: "",
  });
  const [noteForm, setNoteForm] = useState({ contenu: "" });
  const [coutForm, setCoutForm] = useState({
    type: "Dépense",
    montant: "",
    description: "",
    modePaiement: "Espèces",
  });

  const [succes, setSucces] = useState(null);

  // === CHANTIER ===
  const openEditChantier = () => {
    setChantierForm({
      nom: chantier.nom,
      localisation: chantier.localisation,
      dateDebut: chantier.dateDebut?.split("T")[0] || "",
      dateFinPrevue: chantier.dateFinPrevue?.split("T")[0] || "",
      budget: chantier.budget || "",
      etat: chantier.etat,
      responsable: chantier.responsable?._id || "",
    });
    setChantierModal(true);
  };

  const handleChantier = async (e) => {
    e.preventDefault();
    try {
      await modifierChantierMut({
        id,
        ...chantierForm,
        budget: Number(chantierForm.budget),
        responsable: chantierForm.responsable || null,
      }).unwrap();
      setChantierModal(false);
      setSucces({ type: "warning", message: "Chantier modifié avec succès" });
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };
  // === TRAVAUX ===
  const openCreateTravail = () => {
    setTravailForm({ titre: "", description: "" });
    setEditMode(false);
    setSelectedId(null);
    setTravailModal(true);
  };

  const openEditTravail = (t) => {
    setTravailForm({ titre: t.titre, description: t.description || "" });
    setEditMode(true);
    setSelectedId(t._id);
    setTravailModal(true);
  };

  const handleTravail = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await modifierTravail({ id: selectedId, ...travailForm }).unwrap();
        setSucces({ type: "warning", message: "Travail modifié" });
      } else {
        await creerTravail({ ...travailForm, chantier: id }).unwrap();
        setSucces({ type: "success", message: "Travail créé" });
      }
      setTravailModal(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // === NOTES ===
  const openCreateNote = () => {
    setNoteForm({ contenu: "" });
    setEditMode(false);
    setSelectedId(null);
    setNoteModal(true);
  };

  const openEditNote = (n) => {
    setNoteForm({ contenu: n.contenu });
    setEditMode(true);
    setSelectedId(n._id);
    setNoteModal(true);
  };

  const handleNote = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await modifierNote({ id: selectedId, ...noteForm }).unwrap();
        setSucces({ type: "warning", message: "Note modifiée" });
      } else {
        await creerNote({ ...noteForm, chantier: id }).unwrap();
        setSucces({ type: "success", message: "Note ajoutée" });
      }
      setNoteModal(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // === COÛTS ===
  const openCreateCout = () => {
    setCoutForm({
      type: "Dépense",
      montant: "",
      description: "",
      modePaiement: "Espèces",
    });
    setEditMode(false);
    setSelectedId(null);
    setCoutModal(true);
  };

  const openEditCout = (c) => {
    setCoutForm({
      type: c.type,
      montant: c.montant,
      description: c.description || "",
      modePaiement: c.modePaiement,
    });
    setEditMode(true);
    setSelectedId(c._id);
    setCoutModal(true);
  };

  const handleCout = async (e) => {
    e.preventDefault();
    try {
      const data = { ...coutForm, montant: Number(coutForm.montant) };
      if (editMode) {
        await modifierCout({ id: selectedId, ...data }).unwrap();
        setSucces({ type: "warning", message: "Opération modifiée" });
      } else {
        await creerCout({ ...data, chantier: id }).unwrap();
        setSucces({ type: "success", message: "Opération enregistrée" });
      }
      setCoutModal(false);
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
  const formatMontant = (m) => (m || 0).toLocaleString("fr-FR") + " DT";

  const etatStyle = (etat) => {
    switch (etat) {
      case "Planifié":
        return { bg: "#dbeafe", color: "#2563eb" };
      case "En cours":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "En retard":
        return { bg: "#fee2e2", color: "#dc2626" };
      case "Terminé":
        return { bg: "#f3e8ff", color: "#9333ea" };
      case "Suspendu":
        return { bg: "#fef3c7", color: "#d97706" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  const travailEtatStyle = (etat) => {
    switch (etat) {
      case "Terminé":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "En cours":
        return { bg: "#dbeafe", color: "#2563eb" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };
  useEffect(() => {
    socket.emit('join-chantier', id);

    socket.on('chantier-updated', () => refetchChantier());
    socket.on('travail-updated', () => { refetchTravaux(); refetchChantier(); });
    socket.on('tache-updated', () => { refetchTravaux(); refetchChantier(); });
    socket.on('note-added', () => refetchNotes());
    socket.on('note-updated', () => refetchNotes());
    socket.on('note-deleted', () => refetchNotes());

    return () => {
      socket.off('chantier-updated');
      socket.off('travail-updated');
      socket.off('tache-updated');
      socket.off('note-added');
      socket.off('note-updated');
      socket.off('note-deleted');
    };
  }, [id, refetchChantier, refetchTravaux, refetchNotes, refetchCouts]);

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

  if (!chantier) return <p className="text-gray-500">Chantier non trouvé</p>;

  const es = etatStyle(chantier.etat);

  return (
    <div>
      {/* Bouton retour */}
      <button
        onClick={() => navigate("/admin/chantiers")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
        style={{ transition: "color 0.15s" }}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour aux chantiers
      </button>

      {/* Header chantier */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{chantier.nom}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {chantier.localisation}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ backgroundColor: es.bg, color: es.color }}
            >
              {chantier.etat}
            </span>
            <button
              onClick={openEditChantier}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
              style={{ transition: "all 0.15s" }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">Responsable</p>
            <p className="text-sm font-medium text-gray-800">
              {chantier.responsable
                ? `${chantier.responsable.prenom} ${chantier.responsable.nom}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Dates</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(chantier.dateDebut)} →{" "}
              {formatDate(chantier.dateFinPrevue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Budget</p>
            <p className="text-sm font-medium text-gray-800">
              {formatMontant(chantier.budget)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Avancement</p>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${chantier.avancement || 0}%`,
                    backgroundColor: "#dc5539",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-800">
                {chantier.avancement || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message succès */}
      <Alert type={succes?.type} message={succes?.message} />

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { id: "travaux", label: "Travaux" },
          { id: "financement", label: "Financement" },
          { id: "notes", label: "Notes" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOnglet(tab.id)}
            className="px-4 py-2.5 text-sm font-medium border-b-2"
            style={{
              borderColor: onglet === tab.id ? "#dc5539" : "transparent",
              color: onglet === tab.id ? "#dc5539" : "#6b7280",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== ONGLET TRAVAUX ===== */}
      {onglet === "travaux" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Travaux ({travaux.length})
            </h3>
            <button
              onClick={openCreateTravail}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#dc5539" }}
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
              Ajouter
            </button>
          </div>

          {travaux.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucun travail pour ce chantier
            </p>
          ) : (
            <div className="space-y-3">
              {travaux.map((t) => {
                const tes = travailEtatStyle(t.etat);
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
                        <span className="text-sm font-medium text-gray-800">
                          {t.titre}
                        </span>
                        {t.nbTaches > 0 ? (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: tes.bg,
                              color: tes.color,
                            }}
                            title="État géré automatiquement par les tâches"
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
                              backgroundColor: tes.bg,
                              color: tes.color,
                              outline: "none",
                            }}
                          >
                            <option value="Non commencé">Non commencé</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        )}
                        <span className="text-xs text-gray-400">
                          {t.nbTaches} tâches
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditTravail(t);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500"
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
                          onClick={async (e) => {
                            e.stopPropagation();
                            await supprimerTravail(t._id).unwrap();
                            setSucces({
                              type: "delete",
                              message: "Travail supprimé",
                            });
                            setTimeout(() => setSucces(null), 3000);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
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
                    {isOpen && <TachesList travailId={t._id} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== ONGLET FINANCEMENT ===== */}
      {onglet === "financement" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {/* Résumé financier */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#dbeafe" }}
            >
              <p className="text-xs font-medium" style={{ color: "#2563eb" }}>
                Budget initial
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: "#1e40af" }}
              >
                {formatMontant(coutsData?.budget)}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <p className="text-xs font-medium" style={{ color: "#dc2626" }}>
                Total dépenses
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: "#991b1b" }}
              >
                {formatMontant(coutsData?.totalDepense)}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#dcfce7" }}
            >
              <p className="text-xs font-medium" style={{ color: "#16a34a" }}>
                Total reçu
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: "#166534" }}
              >
                {formatMontant(coutsData?.totalRecu)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Opérations</h3>
            <button
              onClick={openCreateCout}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#dc5539" }}
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
              Ajouter
            </button>
          </div>

          {!coutsData?.couts || coutsData.couts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune opération
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                    Mode
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                    Montant
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {coutsData.couts.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    style={{ transition: "background-color 0.1s" }}
                  >
                    <td className="py-3 px-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor:
                            c.type === "Dépense" ? "#fee2e2" : "#dcfce7",
                          color: c.type === "Dépense" ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      {c.description || "—"}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-500">
                      {c.modePaiement}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td
                      className="py-3 px-3 text-sm font-semibold text-right"
                      style={{
                        color: c.type === "Dépense" ? "#dc2626" : "#16a34a",
                      }}
                    >
                      {c.type === "Dépense" ? "-" : "+"}
                      {formatMontant(c.montant)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditCout(c)}
                          className="p-1 text-gray-400 hover:text-blue-500"
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
                            await supprimerCout(c._id).unwrap();
                            setSucces({
                              type: "delete",
                              message: "Opération supprimée",
                            });
                            setTimeout(() => setSucces(null), 3000);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ===== ONGLET NOTES ===== */}
      {onglet === "notes" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Notes ({notes.length})
            </h3>
            <button
              onClick={openCreateNote}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#dc5539" }}
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
              Ajouter
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune note
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div
                  key={n._id}
                  className="border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{n.contenu}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">
                          {n.auteur?.prenom} {n.auteur?.nom}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditNote(n)}
                        className="p-1 text-gray-400 hover:text-blue-500"
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
                          await supprimerNote(n._id).unwrap();
                          setSucces({
                            type: "delete",
                            message: "Note supprimée",
                          });
                          setTimeout(() => setSucces(null), 3000);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Travail */}
      {travailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setTravailModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Modifier le travail" : "Ajouter un travail"}
            </h3>
            <form onSubmit={handleTravail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={travailForm.titre}
                  onChange={(e) =>
                    setTravailForm({ ...travailForm, titre: e.target.value })
                  }
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
                  value={travailForm.description}
                  onChange={(e) =>
                    setTravailForm({
                      ...travailForm,
                      description: e.target.value,
                    })
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
                  onClick={() => setTravailModal(false)}
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

      {/* Modal Note */}
      {noteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setNoteModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Modifier la note" : "Ajouter une note"}
            </h3>
            <form onSubmit={handleNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu
                </label>
                <textarea
                  value={noteForm.contenu}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, contenu: e.target.value })
                  }
                  required
                  rows="4"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {editMode ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Coût */}
      {coutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setCoutModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Modifier l'opération" : "Ajouter une opération"}
            </h3>
            <form onSubmit={handleCout} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={coutForm.type}
                    onChange={(e) =>
                      setCoutForm({ ...coutForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  >
                    <option value="Dépense">Dépense</option>
                    <option value="Règlement">Règlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant (DT)
                  </label>
                  <input
                    type="number"
                    value={coutForm.montant}
                    onChange={(e) =>
                      setCoutForm({ ...coutForm, montant: e.target.value })
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={coutForm.description}
                  onChange={(e) =>
                    setCoutForm({ ...coutForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement
                </label>
                <select
                  value={coutForm.modePaiement}
                  onChange={(e) =>
                    setCoutForm({ ...coutForm, modePaiement: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCoutModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {editMode ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Chantier */}
      {/* Modal Modifier Chantier */}
      {chantierModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setChantierModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Modifier le chantier
            </h3>
            <form onSubmit={handleChantier} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={chantierForm.nom}
                    onChange={(e) =>
                      setChantierForm({ ...chantierForm, nom: e.target.value })
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={chantierForm.localisation}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        localisation: e.target.value,
                      })
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
                    Date début
                  </label>
                  <input
                    type="date"
                    value={chantierForm.dateDebut}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        dateDebut: e.target.value,
                      })
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin prévue
                  </label>
                  <input
                    type="date"
                    value={chantierForm.dateFinPrevue}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        dateFinPrevue: e.target.value,
                      })
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
                    Budget (DT)
                  </label>
                  <input
                    type="number"
                    value={chantierForm.budget}
                    onChange={(e) =>
                      setChantierForm({
                        ...chantierForm,
                        budget: e.target.value,
                      })
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    État
                  </label>
                  <select
                    value={chantierForm.etat}
                    onChange={(e) =>
                      setChantierForm({ ...chantierForm, etat: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{ outline: "none" }}
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="En retard">En retard</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsable
                </label>
                <select
                  value={chantierForm.responsable}
                  onChange={(e) =>
                    setChantierForm({
                      ...chantierForm,
                      responsable: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none" }}
                >
                  <option value="">— Aucun responsable —</option>
                  {responsables.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.prenom} {r.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChantierModal(false)}
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
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChantierDetail;
