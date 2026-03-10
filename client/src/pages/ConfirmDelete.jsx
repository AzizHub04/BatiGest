import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useConfirmDeleteMutation } from "../services/authApiSlice";
import { clearUtilisateur } from "../services/authSlice";
import {
  PhoneIcon,
  LoadingSpinner,
  CheckIcon,
  CloseIcon,
} from "../components/icons/SvgIcons";

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
            <PhoneIcon width={20} height={20} color="white" strokeW={1.5} />
          </div>
          <span className="font-extrabold text-gray-800 text-xl">BatiGest</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          {status === "loading" && (
            <>
              <LoadingSpinner size={8} color="#dc5539" />
              <p className="text-sm text-gray-500 mt-2">
                Suppression en cours...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#dcfce7" }}
              >
                <CheckIcon width={24} height={24} color="#16a34a" />
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
                <CloseIcon width={24} height={24} color="#dc5539" />
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
