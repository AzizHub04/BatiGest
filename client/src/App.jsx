import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import MonChantier from "./pages/responsable/MonChantier";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil → redirige vers login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Page Login */}
        <Route path="/login" element={<Login />} />

        {/* Routes Admin protégées */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin">
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Routes Responsable protégées */}
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
