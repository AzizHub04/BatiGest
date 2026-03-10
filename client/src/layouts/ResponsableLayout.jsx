import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../services/authApiSlice";
import { clearUtilisateur } from "../services/authSlice";
import NotificationBell from "../components/NotificationBell";
import {
  PhoneIcon,
  HouseIcon,
  CheckSquareIcon,
  NoteIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from "../components/icons/SvgIcons";

const ResponsableLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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
      path: "/responsable/chantier",
      label: "Mon chantier",
      icon: <HouseIcon width={20} height={20} color="currentColor" />,
    },
    {
      path: "/responsable/travaux",
      label: "Travaux & Tâches",
      icon: <CheckSquareIcon width={20} height={20} color="currentColor" />,
    },
    {
      path: "/responsable/notes",
      label: "Notes",
      icon: <NoteIcon width={20} height={20} color="currentColor" />,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const getBreadcrumb = () => {
    const path = location.pathname.split("/").filter(Boolean);
    if (path.length < 2) return "";
    const labels = {
      chantier: "Mon chantier",
      travaux: "Travaux & Tâches",
      notes: "Notes",
      profil: "Profil",
    };
    return (
      labels[path[1]] || path[1].charAt(0).toUpperCase() + path[1].slice(1)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
            <PhoneIcon width={18} height={18} color="white" strokeW={1.5} />
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
                if (!isActive(item.path))
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path))
                  e.currentTarget.style.backgroundColor = "transparent";
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

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-12 flex items-center gap-2 px-5 border-t border-gray-100 text-sm text-gray-400 hover:text-gray-600"
          style={{ transition: "color 0.15s" }}
        >
          <span
            style={{
              display: "inline-flex",
              transform: sidebarOpen ? "rotate(0)" : "rotate(180deg)",
              transition: "transform 0.2s",
            }}
          >
            <ChevronLeftIcon width={18} height={18} color="currentColor" />
          </span>
          {sidebarOpen && "Réduire"}
        </button>
      </aside>

      {/* Main */}
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
                  <p className="text-xs text-gray-400">Responsable</p>
                </div>
                <ChevronDownIcon width={16} height={16} color="#9ca3af" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => {
                      navigate("/responsable/profil");
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
        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ResponsableLayout;
