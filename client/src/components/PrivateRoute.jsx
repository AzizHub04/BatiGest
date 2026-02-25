import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useVerifierSessionQuery } from "../services/authApiSlice";

const PrivateRoute = ({ children, rolesAutorises }) => {
  const { utilisateur } = useSelector((state) => state.auth);
  const { isLoading } = useVerifierSessionQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
