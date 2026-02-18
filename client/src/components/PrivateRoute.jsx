import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, role }) => {
  const { utilisateur } = useSelector((state) => state.auth);

  // Pas connecté → rediriger vers login
  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais mauvais rôle → rediriger vers login
  if (role && utilisateur.role !== role) {
    return <Navigate to="/login" replace />;
  }

  // Tout est bon → afficher la page
  return children;
};

export default PrivateRoute;
