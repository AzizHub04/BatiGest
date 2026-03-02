import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
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
import { useEffect } from "react";
import TravauxTaches from "./pages/responsable/TravauxTaches";
import NotesChantier from "./pages/responsable/NotesChantier";

function App() {
  const { utilisateur } = useSelector((state) => state.auth);

  useEffect(() => {
    if (utilisateur) {
      const userId = utilisateur.id || utilisateur._id;
      console.log("Socket connect avec userId:", userId);

      if (!socket.connected) {
        socket.connect();
      }

      // Émettre join après connexion
      if (socket.connected) {
        socket.emit("join", userId);
      } else {
        socket.on("connect", () => {
          socket.emit("join", userId);
        });
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }

    return () => {
      socket.off("connect");
    };
  }, [utilisateur]);

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
          <Route path="ouvriers" element={<div>Ouvriers (à venir)</div>} />
          <Route path="materiaux" element={<div>Materiaux (à venir)</div>} />
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
