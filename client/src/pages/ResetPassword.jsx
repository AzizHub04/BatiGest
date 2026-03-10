import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../services/authApiSlice";
import { PhoneIcon, EyeIcon, EyeOffIcon } from "../components/icons/SvgIcons";
import Alert from "../components/Alert";

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
            <PhoneIcon width={20} height={20} color="white" strokeW={1.5} />
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

          <Alert type="success" message={succes} />

          <Alert type="error" message={erreur} />

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
                      <EyeOffIcon width={18} height={18} />
                    ) : (
                      <EyeIcon width={18} height={18} />
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
                      <EyeOffIcon width={18} height={18} />
                    ) : (
                      <EyeIcon width={18} height={18} />
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
