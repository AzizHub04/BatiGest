import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetChantierByResponsableQuery } from "../../services/chantierApiSlice";
import socket from "../../services/socket";
import { useGetMateriauxChantierQuery } from "../../services/mouvementApiSlice";
import { useGetOuvriersPresentQuery } from "../../services/pointageApiSlice";
import {
  LoadingSpinner,
  HouseIcon,
  LocationIcon,
  ChartIcon,
  CalendarIcon,
  ClockIcon,
  BoxIcon,
  PeopleIcon,
} from "../../components/icons/SvgIcons";

const MonChantier = () => {
  const { utilisateur } = useSelector((state) => state.auth);
  const {
    data: chantier,
    isLoading,
    refetch,
  } = useGetChantierByResponsableQuery(utilisateur?.id);
  const { data: materiauxChantier = [], refetch: refetchMateriaux } =
    useGetMateriauxChantierQuery(chantier?._id, { skip: !chantier });
  const { data: ouvriersPresents = [], refetch: refetchOuvriers } =
    useGetOuvriersPresentQuery(chantier?._id, { skip: !chantier });

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

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const avancementColor = (pct) => {
    if (pct >= 75) return "#16a34a";
    if (pct >= 50) return "#dc5539";
    if (pct >= 25) return "#d97706";
    return "#9ca3af";
  };
  useEffect(() => {
    if (chantier) {
      socket.emit("join-chantier", chantier._id);

      socket.on("chantier-updated", () => {
        refetch();
      });

      socket.on("travail-updated", () => {
        refetch();
      });

      socket.on("tache-updated", () => {
        refetch();
      });
      socket.on("pointage-updated", () => {
        refetchOuvriers();
      });
      socket.on("mouvement-updated", () => {
        refetchMateriaux();
      });
    }

    return () => {
      socket.off("chantier-updated");
      socket.off("travail-updated");
      socket.off("tache-updated");
      socket.off("pointage-updated");
      socket.off("mouvement-updated");
    };
  }, [chantier, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={8} color="#dc5539" />
      </div>
    );
  }

  if (!chantier) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <HouseIcon width={48} height={48} color="#9ca3af" />
        <p className="text-gray-500 mt-4 text-lg font-medium">
          Aucun chantier assigné
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Contactez votre administrateur pour être assigné à un chantier.
        </p>
      </div>
    );
  }

  const es = etatStyle(chantier.etat);
  const avancement = chantier.avancement || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{chantier.nom}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <LocationIcon width={14} height={14} color="#9ca3af" />
              <p className="text-sm text-gray-500 truncate">{chantier.localisation}</p>
            </div>
          </div>
          <span
            className="shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: es.bg, color: es.color }}
          >
            {chantier.etat}
          </span>
        </div>
      </div>

      {/* Cartes — 1 col on mobile, 2 on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Progression */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "#dc55391a" }}
            >
              <ChartIcon width={20} height={20} color="#dc5539" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Progression</p>
              <p className="text-2xl font-bold text-gray-800">{avancement}%</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 w-full h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${avancement}%`,
                backgroundColor: avancementColor(avancement),
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Délai estimé */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "#dbeafe" }}
            >
              <CalendarIcon width={20} height={20} color="#2563eb" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Délai estimé</p>
              <p className="text-base sm:text-lg font-bold text-gray-800 leading-snug">
                {formatDate(chantier.dateFinPrevue)}
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2">
            <ClockIcon width={13} height={13} color="#9ca3af" />
            <p className="text-xs text-gray-400">
              Début : {formatDate(chantier.dateDebut)}
            </p>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4">
          Informations du chantier
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-50 pb-2 sm:pb-0 last:border-0 last:pb-0">
            <p className="text-xs text-gray-400">Responsable</p>
            <p className="text-sm font-medium text-gray-800">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
          </div>
          <div className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-50 pb-2 sm:pb-0">
            <p className="text-xs text-gray-400">Date de début</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(chantier?.dateDebut)}
            </p>
          </div>
          <div className="flex sm:block items-center justify-between">
            <p className="text-xs text-gray-400">Date de fin prévue</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(chantier.dateFinPrevue)}
            </p>
          </div>
        </div>
      </div>
      {/* ── Matériaux & Ouvriers ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* ══ Bloc Matériaux disponibles ══ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#dc55391a" }}
            >
              <BoxIcon width={16} height={16} color="#dc5539" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              Matériaux sur le chantier
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#dc55391a", color: "#dc5539" }}
            >
              {materiauxChantier.length}
            </span>
          </div>

          {materiauxChantier.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BoxIcon width={32} height={32} color="#d1d5db" />
              <p className="text-xs text-gray-400 mt-2">
                Aucun matériel affecté
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {materiauxChantier.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: "#f9fafb" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#dbeafe" }}
                    >
                      <BoxIcon width={14} height={14} color="#2563eb" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.materiel?.nom}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.materiel?.categorie}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#dc5539" }}
                    >
                      {item.quantite} {item.materiel?.unite}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Depuis{" "}
                      {new Date(
                        item.dernierMouvement + "T12:00:00",
                      ).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══ Bloc Ouvriers présents ══ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#16a34a1a" }}
            >
              <PeopleIcon width={16} height={16} color="#16a34a" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              Ouvriers présents aujourd'hui
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#16a34a1a", color: "#16a34a" }}
            >
              {ouvriersPresents.filter((o) => o.presentAujourdhui).length}
            </span>
          </div>

          {ouvriersPresents.filter((o) => o.presentAujourdhui).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <PeopleIcon width={32} height={32} color="#d1d5db" />
              <p className="text-xs text-gray-400 mt-2">
                Aucun ouvrier présent aujourd'hui
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ouvriersPresents
                .filter((o) => o.presentAujourdhui)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: "#f9fafb" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{
                          backgroundColor:
                            item.type === "responsable" ? "#2563eb" : "#dc5539",
                        }}
                      >
                        {item.personne?.prenom?.[0]}
                        {item.personne?.nom?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-800">
                            {item.personne?.prenom} {item.personne?.nom}
                          </p>
                          {item.type === "responsable" && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                              R
                            </span>
                          )}
                        </div>
                        {item.personne?.telephone && (
                          <p className="text-[10px] text-gray-400">
                            {item.personne.telephone}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {item.joursTotal} jour{item.joursTotal > 1 ? "s" : ""} ce
                      mois
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonChantier;
