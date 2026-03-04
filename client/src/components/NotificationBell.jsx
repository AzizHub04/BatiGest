import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetNotificationsQuery,
  useMarquerToutLuMutation,
  useMarquerLuMutation,
  useSupprimerNotificationMutation,
  useSupprimerToutNotificationsMutation,
} from "../services/notificationApiSlice";
import socket from "../services/socket";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { utilisateur } = useSelector((state) => state.auth);
  const { data, refetch } = useGetNotificationsQuery();
  const [marquerToutLu] = useMarquerToutLuMutation();
  const [marquerLu] = useMarquerLuMutation();
  const [supprimerNotification] = useSupprimerNotificationMutation();
  const [supprimerTout] = useSupprimerToutNotificationsMutation();
  const [open, setOpen] = useState(false);

  const notifications = data?.notifications || [];
  const nonLues = data?.nonLues || 0;

  useEffect(() => {
    socket.on("nouvelle-notification", () => refetch());

    return () => {
      socket.off("nouvelle-notification");
    };
  }, [refetch]);

  const handleMarquerToutLu = async () => {
    try {
      await marquerToutLu().unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSupprimerTout = async () => {
    try {
      await supprimerTout().unwrap();
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = async (notif) => {
    if (!notif.estLue) {
      try {
        await marquerLu(notif._id).unwrap();
      } catch (err) {
        console.error(err);
      }
    }
    setOpen(false);
    if (notif.note && notif.chantier) {
      if (utilisateur?.role === 'admin') {
        navigate(`/admin/chantiers/${notif.chantier._id}`);
      } else {
        navigate('/responsable/notes');
      }
    }
  };

  const handleSupprimer = async (e, id) => {
    e.stopPropagation();
    try {
      await supprimerNotification(id).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    const now = new Date();
    const date = new Date(d);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const noteIcon = (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "#dc55391a" }}
    >
      <svg
        width="14"
        height="14"
        fill="none"
        stroke="#dc5539"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-gray-600"
        style={{ transition: "color 0.15s" }}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {nonLues > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            style={{ backgroundColor: "#dc5539" }}
          >
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-800">Notifications</h4>
              <div className="flex items-center gap-3">
                {nonLues > 0 && (
                  <button
                    onClick={handleMarquerToutLu}
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: "#dc5539" }}
                  >
                    Tout marquer lu
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleSupprimerTout}
                    className="text-[11px] text-gray-400 hover:text-red-500 font-medium"
                  >
                    Vider
                  </button>
                )}
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <p className="text-xs text-gray-400 mt-2">
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                    style={{
                      backgroundColor: n.estLue ? "transparent" : "#dc553908",
                      transition: "background-color 0.15s",
                      borderLeft: n.estLue
                        ? "3px solid transparent"
                        : "3px solid #dc5539",
                    }}
                  >
                    {noteIcon}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">
                        {n.titre}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {formatDate(n.createdAt)}
                        </span>
                        {n.chantier && (
                          <>
                            <span className="text-[10px] text-gray-300">•</span>
                            <span
                              className="text-[10px]"
                              style={{ color: "#dc5539" }}
                            >
                              {n.chantier.nom}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.estLue && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "#dc5539" }}
                        />
                      )}
                      <button
                        onClick={(e) => handleSupprimer(e, n._id)}
                        className="p-1 text-gray-300 hover:text-red-500"
                        style={{ transition: "color 0.15s" }}
                      >
                        <svg
                          width="12"
                          height="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
