import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetChantierByResponsableQuery } from "../../services/chantierApiSlice";
import socket from "../../services/socket";

const MonChantier = () => {
  const { utilisateur } = useSelector((state) => state.auth);
  const {
    data: chantier,
    isLoading,
    refetch,
  } = useGetChantierByResponsableQuery(utilisateur?.id);

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
    }

    return () => {
      socket.off("chantier-updated");
      socket.off("travail-updated");
      socket.off("tache-updated");
    };
  }, [chantier, refetch]);

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

  if (!chantier) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <svg
          width="48"
          height="48"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{chantier.nom}</h2>
            <div className="flex items-center gap-2 mt-1">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-sm text-gray-500">{chantier.localisation}</p>
            </div>
          </div>
          <span
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ backgroundColor: es.bg, color: es.color }}
          >
            {chantier.etat}
          </span>
        </div>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Progression */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#dc55391a" }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#dc5539"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Progression</p>
              <p className="text-2xl font-bold text-gray-800">{avancement}%</p>
            </div>
          </div>
          <div className="mt-4 w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#dbeafe" }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Délai estimé</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatDate(chantier.dateFinPrevue)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-xs text-gray-400">
              Début : {formatDate(chantier.dateDebut)}
            </p>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Informations du chantier
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Responsable</p>
            <p className="text-sm font-medium text-gray-800">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Date de début</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(chantier.dateDebut)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Date de fin prévue</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(chantier.dateFinPrevue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonChantier;
