import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../services/authApiSlice";
import { clearUtilisateur } from "../services/authSlice";
import NotificationBell from "../components/NotificationBell";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { utilisateur } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    dispatch(clearUtilisateur());
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      path: "/admin/responsables",
      label: "Responsables",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      path: "/admin/chantiers",
      label: "Chantiers",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 21V9h6v12" />
          <path d="M3 9h18" />
        </svg>
      ),
    },
    {
      path: "/admin/ouvriers",
      label: "Ouvriers",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M4 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M17.5 7.5h4M19.5 5.5v4" />
        </svg>
      ),
    },
    {
      path: "/admin/materiaux",
      label: "Matériaux",
      icon: (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
        </svg>
      ),
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname.split("/").filter(Boolean);
    if (path.length < 2) return "";
    return path[1].charAt(0).toUpperCase() + path[1].slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ===== SIDEBAR ===== */}
      <aside
        className="fixed top-0 left-0 h-full bg-white border-r border-gray-100 flex flex-col z-30"
        style={{
          width: sidebarOpen ? 240 : 72,
          transition: "width 0.2s ease-out",
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#dc5539" }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect
                x="3"
                y="2"
                width="18"
                height="20"
                rx="2"
                stroke="white"
                strokeWidth="1.5"
              />
              <rect
                x="7"
                y="5"
                width="3"
                height="3"
                rx="0.5"
                fill="rgba(255,255,255,0.7)"
              />
              <rect
                x="14"
                y="5"
                width="3"
                height="3"
                rx="0.5"
                fill="rgba(255,255,255,0.7)"
              />
              <rect
                x="7"
                y="10"
                width="3"
                height="3"
                rx="0.5"
                fill="rgba(255,255,255,0.7)"
              />
              <rect
                x="14"
                y="10"
                width="3"
                height="3"
                rx="0.5"
                fill="rgba(255,255,255,0.7)"
              />
              <path
                d="M9 22v-5h6v5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {sidebarOpen && (
            <span className="font-extrabold text-gray-800 text-lg">
              BatiGest
            </span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: isActive(item.path)
                  ? "#dc55390f"
                  : "transparent",
                color: isActive(item.path) ? "#dc5539" : "#6b7280",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span
                className="flex-shrink-0"
                style={{ color: isActive(item.path) ? "#dc5539" : "#9ca3af" }}
              >
                {item.icon}
              </span>
              {sidebarOpen && item.label}
            </Link>
          ))}
        </nav>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-12 flex items-center gap-2 px-5 border-t border-gray-100 text-sm text-gray-400 hover:text-gray-600"
          style={{ transition: "color 0.15s" }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            style={{
              transform: sidebarOpen ? "rotate(0)" : "rotate(180deg)",
              transition: "transform 0.2s",
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {sidebarOpen && "Réduire"}
        </button>
      </aside>

      {/* ===== MAIN ===== */}
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarOpen ? 240 : 72,
          transition: "margin-left 0.2s ease-out",
        }}
      >
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <div>
            <p className="text-xs text-gray-400">Gestion / {getBreadcrumb()}</p>
            <h1 className="text-lg font-bold text-gray-800">
              {getBreadcrumb()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <NotificationBell />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: "#dc5539" }}
                >
                  {utilisateur?.prenom?.[0]}
                  {utilisateur?.nom?.[0]}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {utilisateur?.prenom} {utilisateur?.nom}
                  </p>
                  <p className="text-xs text-gray-400">Administrateur</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => {
                      navigate("/admin/profil");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    style={{ transition: "background-color 0.15s" }}
                  >
                    Mon profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    style={{ transition: "background-color 0.15s" }}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
