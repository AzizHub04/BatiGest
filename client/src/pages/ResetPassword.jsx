import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../services/authApiSlice";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();

  const [mdp, setMdp] = useState("");
  const [confirmer, setConfirmer] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [voirConfirmer, setVoirConfirmer] = useState(false);
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    if (mdp !== confirmer) {
      setErreur("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await resetPassword({ token, nouveauMotDePasse: mdp }).unwrap();
      setSucces("Mot de passe réinitialisé avec succès");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Lien invalide ou expiré");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Nouveau mot de passe
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>

          {succes && (
            <div
              className="mb-4 p-3 rounded-xl flex items-center gap-2"
              style={{
                backgroundColor: "#dcfce7",
                border: "1px solid #bbf7d0",
              }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#16a34a" }}>
                {succes}
              </p>
            </div>
          )}

          {erreur && (
            <div
              className="mb-4 p-3 rounded-xl flex items-center gap-2"
              style={{
                backgroundColor: "#dc55391a",
                border: "1px solid #dc55394d",
              }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="#dc5539"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#dc5539" }}>
                {erreur}
              </p>
            </div>
          )}

          {!succes && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={voirMdp ? "text" : "password"}
                    value={mdp}
                    onChange={(e) => setMdp(e.target.value)}
                    required
                    className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                  <button
                    type="button"
                    onClick={() => setVoirMdp(!voirMdp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ transition: "color 0.15s" }}
                  >
                    {voirMdp ? (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={voirConfirmer ? "text" : "password"}
                    value={confirmer}
                    onChange={(e) => setConfirmer(e.target.value)}
                    required
                    className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                  <button
                    type="button"
                    onClick={() => setVoirConfirmer(!voirConfirmer)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ transition: "color 0.15s" }}
                  >
                    {voirConfirmer ? (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-white rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: "#dc5539",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#c44a30")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#dc5539")
                }
              >
                Réinitialiser
              </button>
            </form>
          )}

          {succes && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Redirection vers la page de connexion...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
