import { useState } from "react";
import ListeOuvriers from "../../components/ouvriers/ListeOuvriers";
import FichePointage from "../../components/ouvriers/FichePointage";
import PaiementsOuvriers from "../../components/ouvriers/PaiementsOuvriers";

const Ouvriers = () => {
  const [onglet, setOnglet] = useState("liste");

  const onglets = [
    {
      id: "liste",
      label: "Liste des ouvriers",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "pointage",
      label: "Fiche de pointage",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: "paiements",
      label: "Paiements",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {onglets.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOnglet(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2"
            style={{
              borderColor: onglet === tab.id ? "#dc5539" : "transparent",
              color: onglet === tab.id ? "#dc5539" : "#6b7280",
              transition: "all 0.15s",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {onglet === "liste" && <ListeOuvriers />}
      {onglet === "pointage" && <FichePointage />}
      {onglet === "paiements" && <PaiementsOuvriers />}
    </div>
  );
};

export default Ouvriers;
