import { useSelector } from "react-redux";
import { useGetChantierByResponsableQuery } from "../../services/chantierApiSlice";
import TravauxSection from "../../components/chantier/TravauxSection";

const TravauxTaches = () => {
  const { utilisateur } = useSelector((state) => state.auth);
  const { data: chantier } = useGetChantierByResponsableQuery(utilisateur?.id);

  if (!chantier) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg font-medium">
          Aucun chantier assigné
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Contactez votre administrateur.
        </p>
      </div>
    );
  }

  return (
    <TravauxSection chantierId={chantier._id} showPageHeader />
  );
};

export default TravauxTaches;
