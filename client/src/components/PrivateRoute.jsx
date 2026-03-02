import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, rolesAutorises }) => {
  const { utilisateur } = useSelector((state) => state.auth);

  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
    if (utilisateur.role === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (utilisateur.role === "responsable")
      return <Navigate to="/responsable/chantier" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
