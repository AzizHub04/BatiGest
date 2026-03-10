import { useState } from "react";
import ListeMateriels from "../../components/materiaux/ListeMateriels";
import MouvementsMateriels from "../../components/materiaux/MouvementsMateriels";
import { BoxIcon, SwapIcon } from "../../components/icons/SvgIcons";

const Materiaux = () => {
  const [onglet, setOnglet] = useState("liste");

  const onglets = [
    {
      id: "liste",
      label: "Liste des matériaux",
      icon: <BoxIcon width={16} height={16} color="currentColor" />,
    },
    {
      id: "mouvements",
      label: "Mouvements",
      icon: <SwapIcon width={16} height={16} color="currentColor" />,
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
