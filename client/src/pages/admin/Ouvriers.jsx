import { useState } from "react";
import ListeOuvriers from "../../components/ouvriers/ListeOuvriers";
import FichePointage from "../../components/ouvriers/FichePointage";
import PaiementsOuvriers from "../../components/ouvriers/PaiementsOuvriers";
import { PeopleIcon, CalendarIcon, CurrencyIcon } from "../../components/icons/SvgIcons";

const Ouvriers = () => {
  const [onglet, setOnglet] = useState("liste");

  const onglets = [
    {
      id: "liste",
      label: "Liste des ouvriers",
      icon: <PeopleIcon width={16} height={16} color="currentColor" />,
    },
    {
      id: "pointage",
      label: "Fiche de pointage",
      icon: <CalendarIcon width={16} height={16} color="currentColor" />,
    },
    {
      id: "paiements",
      label: "Paiements",
      icon: <CurrencyIcon width={16} height={16} color="currentColor" />,
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
