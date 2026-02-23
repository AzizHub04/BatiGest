import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useModifierProfilMutation,
  useChangerMotDePasseMutation,
  useDemandeSuppressionMutation,
  useLogoutMutation,
} from "../services/authApiSlice";
import { setUtilisateur, clearUtilisateur } from "../services/authSlice";

const Profil = () => {
  const { utilisateur } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [modifierProfil] = useModifierProfilMutation();
  const [changerMotDePasse] = useChangerMotDePasseMutation();
  const [demandeSuppression] = useDemandeSuppressionMutation();
  const [logout] = useLogoutMutation();

  // States profil
  const [profil, setProfil] = useState({ nom: "", prenom: "", email: "" });
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");

  // States mot de passe
  const [mdp, setMdp] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: "",
  });
  const [voirAncien, setVoirAncien] = useState(false);
  const [voirNouveau, setVoirNouveau] = useState(false);
  const [voirConfirmer, setVoirConfirmer] = useState(false);
  const [succesMdp, setSuccesMdp] = useState("");
  const [erreurMdp, setErreurMdp] = useState("");

  // States suppression
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteMdp, setDeleteMdp] = useState("");
  const [erreurDelete, setErreurDelete] = useState("");
  const [succesDelete, setSuccesDelete] = useState("");

  // Onglet actif
  const [onglet, setOnglet] = useState("profil");

  useEffect(() => {
    if (utilisateur) {
      setProfil({
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
      });
    }
  }, [utilisateur]);

  // Modifier profil
  const handleProfil = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    try {
      const res = await modifierProfil(profil).unwrap();
      dispatch(setUtilisateur(res.utilisateur));
      setSucces("Profil modifié avec succès");
      setTimeout(() => setSucces(""), 3000);
    } catch (err) {
      setErreur(err?.data?.message || "Erreur");
    }
  };

  // Changer mot de passe
  const handleMotDePasse = async (e) => {
    e.preventDefault();
    setErreurMdp("");
    setSuccesMdp("");

    if (mdp.nouveauMotDePasse !== mdp.confirmerMotDePasse) {
      setErreurMdp("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await changerMotDePasse({
        ancienMotDePasse: mdp.ancienMotDePasse,
        nouveauMotDePasse: mdp.nouveauMotDePasse,
      }).unwrap();
      setSuccesMdp("Mot de passe modifié avec succès");
      setMdp({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmerMotDePasse: "",
      });
      setTimeout(() => setSuccesMdp(""), 3000);
    } catch (err) {
      setErreurMdp(err?.data?.message || "Erreur");
    }
  };

  // Demander suppression
  const handleDelete = async (e) => {
    e.preventDefault();
    setErreurDelete("");
    try {
      await demandeSuppression({ motDePasse: deleteMdp }).unwrap();
      setSuccesDelete(
        "Email de confirmation envoyé. Vérifiez votre boîte mail.",
      );
      setDeleteMdp("");
      setTimeout(() => {
        setDeleteModal(false);
        setSuccesDelete("");
      }, 4000);
    } catch (err) {
      setErreurDelete(err?.data?.message || "Erreur");
    }
  };
  // Réinitialiser par email depuis profil
  const handleResetByEmail = async () => {
    try {
      const { forgotPassword } = await import("../services/authApiSlice");
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: utilisateur.email }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        setSuccesMdp("Email de réinitialisation envoyé à " + utilisateur.email);
        setTimeout(() => setSuccesMdp(""), 4000);
      } else {
        setErreurMdp(data.message || "Erreur");
      }
    } catch (err) {
      setErreurMdp("Erreur lors de l'envoi");
    }
  };

  // Icône œil pour les champs mot de passe
  const EyeToggle = ({ visible, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      style={{ transition: "color 0.15s" }}
    >
      {visible ? (
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
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ backgroundColor: "#dc5539" }}
        >
          {utilisateur?.prenom?.[0]}
          {utilisateur?.nom?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {utilisateur?.prenom} {utilisateur?.nom}
          </h2>
          <p className="text-sm text-gray-500">{utilisateur?.email}</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { id: "profil", label: "Mon profil" },
          { id: "securite", label: "Sécurité" },
          { id: "danger", label: "Zone danger" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOnglet(tab.id)}
            className="px-4 py-2.5 text-sm font-medium border-b-2"
            style={{
              borderColor: onglet === tab.id ? "#dc5539" : "transparent",
              color: onglet === tab.id ? "#dc5539" : "#6b7280",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== ONGLET PROFIL ===== */}
      {onglet === "profil" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Informations personnelles
          </h3>

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

          <form onSubmit={handleProfil} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={profil.nom}
                  onChange={(e) =>
                    setProfil({ ...profil, nom: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={profil.prenom}
                  onChange={(e) =>
                    setProfil({ ...profil, prenom: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profil.email}
                onChange={(e) =>
                  setProfil({ ...profil, email: e.target.value })
                }
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                style={{ outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 text-white rounded-xl text-sm font-medium"
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
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== ONGLET SÉCURITÉ ===== */}
      {onglet === "securite" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Changer le mot de passe
          </h3>

          {succesMdp && (
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
                {succesMdp}
              </p>
            </div>
          )}

          {erreurMdp && (
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
                {erreurMdp}
              </p>
            </div>
          )}

          <form onSubmit={handleMotDePasse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancien mot de passe
              </label>
              <div className="relative">
                <input
                  type={voirAncien ? "text" : "password"}
                  value={mdp.ancienMotDePasse}
                  onChange={(e) =>
                    setMdp({ ...mdp, ancienMotDePasse: e.target.value })
                  }
                  required
                  className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <EyeToggle
                  visible={voirAncien}
                  toggle={() => setVoirAncien(!voirAncien)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={voirNouveau ? "text" : "password"}
                  value={mdp.nouveauMotDePasse}
                  onChange={(e) =>
                    setMdp({ ...mdp, nouveauMotDePasse: e.target.value })
                  }
                  required
                  className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <EyeToggle
                  visible={voirNouveau}
                  toggle={() => setVoirNouveau(!voirNouveau)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={voirConfirmer ? "text" : "password"}
                  value={mdp.confirmerMotDePasse}
                  onChange={(e) =>
                    setMdp({ ...mdp, confirmerMotDePasse: e.target.value })
                  }
                  required
                  className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <EyeToggle
                  visible={voirConfirmer}
                  toggle={() => setVoirConfirmer(!voirConfirmer)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 text-white rounded-xl text-sm font-medium"
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
                Changer le mot de passe
              </button>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-4">
              <p className="text-sm text-gray-500 mb-3">
                Vous pouvez aussi réinitialiser votre mot de passe par email.
              </p>
              <button
                type="button"
                onClick={handleResetByEmail}
                className="px-6 py-2.5 border rounded-xl text-sm font-medium"
                style={{
                  borderColor: "#dc5539",
                  color: "#dc5539",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#dc55390f";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Réinitialiser par email
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== ONGLET ZONE DANGER ===== */}
      {onglet === "danger" && (
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Supprimer le compte
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Cette action est irréversible. Un email de confirmation sera envoyé
            à votre adresse.
          </p>
          <button
            onClick={() => {
              setDeleteModal(true);
              setDeleteMdp("");
              setErreurDelete("");
              setSuccesDelete("");
            }}
            className="px-6 py-2.5 text-white rounded-xl text-sm font-medium"
            style={{
              backgroundColor: "#dc2626",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#b91c1c")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc2626")}
          >
            Supprimer mon compte
          </button>
        </div>
      )}

      {/* Modal suppression */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#dc26261a" }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
              Supprimer votre compte ?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Entrez votre mot de passe pour confirmer. Un email de vérification
              sera envoyé.
            </p>

            {succesDelete && (
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
                  {succesDelete}
                </p>
              </div>
            )}

            {erreurDelete && (
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
                  {erreurDelete}
                </p>
              </div>
            )}

            {!succesDelete && (
              <form onSubmit={handleDelete}>
                <input
                  type="password"
                  value={deleteMdp}
                  onChange={(e) => setDeleteMdp(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-4"
                  style={{ outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                    style={{ transition: "background-color 0.15s" }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
                    style={{
                      backgroundColor: "#dc2626",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#b91c1c")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#dc2626")
                    }
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;
