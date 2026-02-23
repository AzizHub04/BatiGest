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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/confirm-delete/:token" element={<ConfirmDelete />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="responsables" element={<Responsables />} />
          <Route path="profil" element={<Profil />} />
          <Route path="chantiers" element={<Chantiers />} />
          <Route path="chantiers/:id" element={<ChantierDetail />} />
        </Route>

        <Route
          path="/responsable/mon-chantier"
          element={
            <PrivateRoute role="responsable">
              <MonChantier />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
