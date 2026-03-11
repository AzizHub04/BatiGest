import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUtilisateur } from "./services/authSlice";
import { API_BASE_URL } from "./config/constants";
import { LoadingSpinner } from "./components/icons/SvgIcons";
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
import socket from "./services/socket";
import { useEffect, useState } from "react";
import TravauxTaches from "./pages/responsable/TravauxTaches";
import NotesChantier from "./pages/responsable/NotesChantier";
import Ouvriers from "./pages/admin/Ouvriers";
import Materiaux from "./pages/admin/Materiaux";

function App() {
  const { utilisateur } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [verifSession, setVerifSession] = useState(true);

  useEffect(() => {
    const verifier = async () => {
      if (utilisateur) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/session`, {
            credentials: "include",
          });
          if (!res.ok) {
            dispatch(clearUtilisateur());
          }
        } catch (error) {
          dispatch(clearUtilisateur());
        }
      }
      setVerifSession(false);
    };
    verifier();
  }, []);

  useEffect(() => {
    if (utilisateur) {
      const userId = String(utilisateur.id || utilisateur._id);

      // Re-join personal room on every connect/reconnect
      const handleConnect = () => {
        socket.emit("join", userId);
      };

      socket.on("connect", handleConnect);

      if (!socket.connected) {
        socket.connect();
      } else {
        // Already connected: join immediately
        socket.emit("join", userId);
      }

      return () => {
        socket.off("connect", handleConnect);
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [utilisateur]);

  if (verifSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size={8} color="#dc5539" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            utilisateur?.role === "admin" ? (
              <Navigate to="/admin/dashboard" />
            ) : utilisateur?.role === "responsable" ? (
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
          <Route path="ouvriers" element={<Ouvriers />} />
          <Route path="materiaux" element={<Materiaux />} />
        </Route>
        <Route
          path="/responsable"
          element={
            <PrivateRoute rolesAutorises={["responsable"]}>
              <ResponsableLayout />
            </PrivateRoute>
          }
        >
          <Route path="chantier" element={<MonChantier />} />
          <Route path="travaux" element={<TravauxTaches />} />
          <Route path="notes" element={<NotesChantier />} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
