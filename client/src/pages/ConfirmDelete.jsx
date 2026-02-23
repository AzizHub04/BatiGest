import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useConfirmDeleteMutation } from "../services/authApiSlice";
import { clearUtilisateur } from "../services/authSlice";

const ConfirmDelete = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [confirmDelete] = useConfirmDeleteMutation();

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supprimer = async () => {
      try {
        await confirmDelete(token).unwrap();
        dispatch(clearUtilisateur());
        setStatus("success");
        setMessage("Votre compte a été supprimé avec succès.");
        setTimeout(() => navigate("/login"), 4000);
      } catch (err) {
        setStatus("error");
        setMessage(err?.data?.message || "Lien invalide ou expiré");
      }
    };
    supprimer();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#dc5539" }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
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
          <span className="font-extrabold text-gray-800 text-xl">BatiGest</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          {status === "loading" && (
            <>
              <svg
                className="animate-spin h-8 w-8 mx-auto mb-4"
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
              <p className="text-sm text-gray-500">Suppression en cours...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#dcfce7" }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Compte supprimé
              </h2>
              <p className="text-sm text-gray-500">{message}</p>
              <p className="text-sm text-gray-400 mt-2">
                Redirection vers la page de connexion...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#dc55391a" }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="#dc5539"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Erreur</h2>
              <p className="text-sm text-gray-500 mb-4">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 text-white rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#dc5539" }}
              >
                Retour au login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
