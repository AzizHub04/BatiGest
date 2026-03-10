import { useState } from "react";
import ListeMateriels from "../../components/materiaux/ListeMateriels";
import MouvementsMateriels from "../../components/materiaux/MouvementsMateriels";

const Materiaux = () => {
  const [onglet, setOnglet] = useState("liste");

  const onglets = [
    {
      id: "liste",
      label: "Liste des matériaux",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: "mouvements",
      label: "Mouvements",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div>
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

      {onglet === "liste" && <ListeMateriels />}
      {onglet === "mouvements" && <MouvementsMateriels />}
    </div>
  );
};

export default Materiaux;
