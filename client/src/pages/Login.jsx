import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../services/authApiSlice";
import { setUtilisateur } from "../services/authSlice";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  CloseIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  LoadingSpinner,
  BrickIcon,
  HammerIcon,
  CraneIcon,
  HelmetIcon,
  WrenchIcon,
  CementIcon,
  RuleIcon,
  GearIcon,
  SawIcon,
  TruckIcon,
  WallIcon,
  PipeIcon,
  PaintIcon,
  BeamIcon,
  LadderIcon,
  BoltIcon,
} from "../components/icons/SvgIcons";

const floatStyles = `
  @keyframes drift1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(12px, -18px) rotate(5deg); }
    50% { transform: translate(-8px, -30px) rotate(-3deg); }
    75% { transform: translate(15px, -12px) rotate(4deg); }
  }
  @keyframes drift2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(-15px, 12px) rotate(-4deg); }
    50% { transform: translate(8px, 20px) rotate(3deg); }
    75% { transform: translate(-10px, 8px) rotate(-2deg); }
  }
  @keyframes drift3 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(20px, -10px) rotate(6deg); }
    66% { transform: translate(-12px, 15px) rotate(-5deg); }
  }
  @keyframes drift4 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-15px, -20px) rotate(-4deg); }
  }
  @keyframes drift5 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(8px, 15px) rotate(3deg); }
    50% { transform: translate(-12px, 8px) rotate(-6deg); }
    75% { transform: translate(4px, -10px) rotate(2deg); }
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const featuresList = [
    "Gestion des chantiers et travaux",
    "Suivi des ouvriers et paiements",
    "Gestion du stock en temps réel",
    "Tableau de bord intelligent",
    "Assistant IA intégré",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex(
        (prevIndex) => (prevIndex + 1) % featuresList.length,
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      const res = await login({ email, motDePasse }).unwrap();
      dispatch(setUtilisateur(res.utilisateur));
      if (res.utilisateur.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/responsable/chantier");
      }
    } catch (err) {
      setErreur(err?.data?.message || "Erreur de connexion");
    }
  };

  const features = [
    "Consultation des Chantiers et Travaux",
    "Suivi des ouvriers et paiements",
    "Gestion du stock en temps réel",
    "Tableau de bord intelligent",
    "Assistant IA intégré",
  ];

  const icons = [
    {
      top: "3%",
      right: "8%",
      w: 65,
      component: CraneIcon,
      anim: "drift1 9s ease-in-out infinite",
    },
    {
      top: "12%",
      left: "8%",
      w: 42,
      component: BrickIcon,
      anim: "drift2 11s ease-in-out infinite",
    },
    {
      top: "28%",
      right: "18%",
      w: 50,
      component: HelmetIcon,
      anim: "drift3 8s ease-in-out infinite",
    },
    {
      top: "55%",
      right: "6%",
      w: 45,
      component: HammerIcon,
      anim: "drift4 10s ease-in-out infinite",
    },
    {
      bottom: "10%",
      right: "22%",
      w: 55,
      component: WrenchIcon,
      anim: "drift5 7s ease-in-out infinite",
    },
    {
      bottom: "30%",
      left: "5%",
      w: 44,
      component: CementIcon,
      anim: "drift1 12s ease-in-out infinite 1s",
    },
    {
      top: "6%",
      right: "38%",
      w: 32,
      component: GearIcon,
      anim: "drift3 9s ease-in-out infinite 0.5s",
    },
    {
      top: "42%",
      left: "10%",
      w: 38,
      component: RuleIcon,
      anim: "drift2 10s ease-in-out infinite 2s",
    },
    {
      bottom: "5%",
      left: "22%",
      w: 40,
      component: BrickIcon,
      anim: "drift5 11s ease-in-out infinite 1.5s",
    },
    {
      top: "72%",
      right: "14%",
      w: 35,
      component: GearIcon,
      anim: "drift4 8s ease-in-out infinite 0.8s",
    },
    {
      top: "20%",
      right: "4%",
      w: 30,
      component: BoltIcon,
      anim: "drift1 7s ease-in-out infinite 1.2s",
    },
    {
      bottom: "45%",
      right: "32%",
      w: 34,
      component: HelmetIcon,
      anim: "drift2 9s ease-in-out infinite 2.5s",
    },
    {
      top: "5%",
      left: "28%",
      w: 48,
      component: TruckIcon,
      anim: "drift3 10s ease-in-out infinite 0.3s",
    },
    {
      top: "38%",
      right: "35%",
      w: 42,
      component: WallIcon,
      anim: "drift5 8s ease-in-out infinite 1.8s",
    },
    {
      bottom: "18%",
      left: "15%",
      w: 36,
      component: PipeIcon,
      anim: "drift4 11s ease-in-out infinite 0.6s",
    },
    {
      top: "65%",
      left: "6%",
      w: 50,
      component: LadderIcon,
      anim: "drift1 9s ease-in-out infinite 2.2s",
    },
    {
      bottom: "3%",
      right: "8%",
      w: 38,
      component: PaintIcon,
      anim: "drift2 7s ease-in-out infinite 1.4s",
    },
    {
      top: "85%",
      left: "30%",
      w: 32,
      component: SawIcon,
      anim: "drift3 10s ease-in-out infinite 0.9s",
    },
    {
      top: "15%",
      right: "25%",
      w: 28,
      component: BeamIcon,
      anim: "drift5 12s ease-in-out infinite 1.7s",
    },
    {
      bottom: "55%",
      left: "25%",
      w: 30,
      component: WrenchIcon,
      anim: "drift4 8s ease-in-out infinite 2.8s",
    },
  ];

  return (
    <>
      <style>{floatStyles}</style>
      <div className="min-h-screen flex relative overflow-hidden">
        {/* ===== PARTIE GAUCHE ===== */}
        <div
          className="hidden lg:flex w-1/2 relative"
          style={{
            background:
              "linear-gradient(180deg, #e8624a 0%, #dc5539 25%, #c44a30 50%, #a33d25 75%, #8b3220 100%)",
          }}
        >
          {icons.map((ic, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: ic.top,
                bottom: ic.bottom,
                left: ic.left,
                right: ic.right,
                width: ic.w,
                height: ic.w,
                animation: ic.anim,
              }}
            >
              <ic.component />
            </div>
          ))}

          <div className="relative z-10 flex flex-col justify-center pl-20 pr-12 xl:pl-28 xl:pr-16 w-full">
            <div
              className="flex items-center gap-3 mb-12"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(-20px)",
                transition: "all 0.6s ease-out",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <PhoneIcon width={26} height={26} color="white" strokeW={1.5} />
              </div>
              <span
                className="font-extrabold text-3xl tracking-tight"
                style={{ color: "#fff4f0" }}
              >
                BatiGest
              </span>
            </div>

            <div
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.7s ease-out 0.2s",
              }}
            >
              <h1
                className="text-4xl xl:text-5xl font-bold leading-tight mb-10"
                style={{ color: "#fff4f0" }}
              >
                Gérez vos chantiers
                <br />
                <span style={{ color: "rgba(255,244,240,0.8)" }}>
                  en toute simplicité
                </span>
              </h1>
            </div>

            <div
              className="relative w-full max-w-sm h-40 rounded-lg overflow-hidden flex items-center px-6"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateX(0)" : "translateX(-40px)",
                transition: "all 0.7s ease-out 0.3s",
              }}
            >
              {featuresList.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center px-6 transition-all duration-700 ${
                    index === currentFeatureIndex
                      ? "opacity-100 scale-100 translate-x-0"
                      : "opacity-0 scale-95 -translate-x-12 pointer-events-none"
                  }`}
                  onMouseEnter={() =>
                    index === currentFeatureIndex &&
                    setCurrentFeatureIndex(currentFeatureIndex)
                  }
                >
                  <h3
                    className="text-2xl font-bold leading-tight"
                    style={{ color: "#fff4f0" }}
                  >
                    {feature}
                  </h3>
                </div>
              ))}

              {/* Indicators */}
              <div className="absolute bottom-3 left-6 flex gap-2">
                {featuresList.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentFeatureIndex ? "w-6" : "w-2"
                    }`}
                    style={{
                      backgroundColor:
                        index === currentFeatureIndex
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== PARTIE DROITE ===== */}
        <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center px-8 py-12">
          <div
            className="w-full max-w-md"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(15px)",
              transition: "all 0.6s ease-out 0.3s",
            }}
          >
            <div className="flex lg:hidden items-center gap-2.5 mb-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#dc5539" }}
              >
                <PhoneIcon width={20} height={20} color="white" strokeW={1.5} />
              </div>
              <span className="font-extrabold text-gray-800 text-xl">
                BatiGest
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Connexion
              </h2>
              <p className="text-sm text-gray-500">
                Entrez vos identifiants pour accéder à votre espace
              </p>
            </div>

            {erreur && (
              <div
                className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5"
                style={{
                  backgroundColor: "#dc55391a",
                  border: "1px solid #dc55394d",
                }}
              >
                <CloseIcon width={18} height={18} color="#dc5539" />
                <p className="text-sm" style={{ color: "#dc5539" }}>
                  {erreur}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <MailIcon width={18} height={18} color="currentColor" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@batigest.tn"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#dc5539";
                      e.target.style.boxShadow = "0 0 0 3px #dc553933";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockIcon width={18} height={18} color="currentColor" />
                  </span>
                  <input
                    type={voirMdp ? "text" : "password"}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm"
                    style={{
                      outline: "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#dc5539";
                      e.target.style.boxShadow = "0 0 0 3px #dc553933";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVoirMdp(!voirMdp)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white rounded-xl text-sm font-semibold mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{
                  background: isLoading
                    ? "#dc5539aa"
                    : "linear-gradient(135deg, #dc5539, #c44a30)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, #c44a30, #a33d25)";
                    e.target.style.boxShadow =
                      "0 0 14px rgba(255, 140, 100, 0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, #dc5539, #c44a30)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size={4} color="white" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
              <div className="text-right mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium"
                  style={{ color: "#dc5539" }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </form>

            <p className="text-center text-xs text-gray-400 mt-8">
              © 2026 BatiGest — Gestion intelligente du bâtiment
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
