import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../services/authApiSlice";
import { PhoneIcon, LoadingSpinner } from "../components/icons/SvgIcons";
import Alert from "../components/Alert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    try {
      await forgotPassword({ email }).unwrap();
      setSucces("Email envoyé ! Vérifiez votre boîte mail.");
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

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

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>

          <Alert type="success" message={succes} />

          <Alert type="error" message={erreur} />

          {!succes && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@batigest.tn"
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                style={{
                  backgroundColor: "#dc5539",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = "#c44a30";
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = "#dc5539";
                }}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size={4} color="white" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </button>
            </form>
          )}

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-sm font-medium"
              style={{ color: "#dc5539" }}
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
