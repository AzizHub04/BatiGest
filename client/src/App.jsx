import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Responsables from "./pages/admin/Responsables";
import MonChantier from "./pages/responsable/MonChantier";
import PrivateRoute from "./components/PrivateRoute";
import Profil from "./pages/Profil";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ConfirmDelete from "./pages/ConfirmDelete";
import Chantiers from "./pages/admin/Chantiers";
import ChantierDetail from "./pages/admin/ChantierDetail";
import ResponsableLayout from "./layouts/ResponsableLayout";
import { useVerifierSessionQuery } from "./services/authApiSlice";
import { useDispatch } from "react-redux";
import { setUtilisateur } from "./services/authSlice";
import { useEffect } from "react";
import socket from "./services/socket";

function App() {
  const dispatch = useDispatch();
  const { data, isLoading, isSuccess } = useVerifierSessionQuery();

  useEffect(() => {
    if (isSuccess && data?.utilisateur) {
      dispatch(setUtilisateur(data.utilisateur));
      if (!socket.connected) {
        socket.connect();
        socket.emit("join", data.utilisateur.id);
      }
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isSuccess, data, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
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
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            data?.utilisateur?.role === "admin" ? (
              <Navigate to="/admin/dashboard" />
            ) : data?.utilisateur?.role === "responsable" ? (
              <Navigate to="/responsable/chantier" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/confirm-delete/:token" element={<ConfirmDelete />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute rolesAutorises={["admin"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="responsables" element={<Responsables />} />
          <Route path="profil" element={<Profil />} />
          <Route path="chantiers" element={<Chantiers />} />
          <Route path="chantiers/:id" element={<ChantierDetail />} />
          <Route path="ouvriers" element={<div>Ouvriers (à venir)</div>} />
          <Route path="materiaux" element={<div>Materiaux (à venir)</div>} />
        </Route>

        {/* Routes Responsable */}
        <Route
          path="/responsable"
          element={
            <PrivateRoute rolesAutorises={["responsable"]}>
              <ResponsableLayout />
            </PrivateRoute>
          }
        >
          <Route path="chantier" element={<MonChantier />} />
          <Route
            path="travaux"
            element={<div>Travaux & Tâches (à venir)</div>}
          />
          <Route path="notes" element={<div>Notes (à venir)</div>} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
