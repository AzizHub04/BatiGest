import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../services/authApiSlice";
import { setUtilisateur } from "../services/authSlice";
import { Link } from "react-router-dom";

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

const brickSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <rect
      x="2"
      y="8"
      width="16"
      height="10"
      rx="1"
      stroke="white"
      strokeWidth="1.2"
    />
    <rect
      x="22"
      y="8"
      width="16"
      height="10"
      rx="1"
      stroke="white"
      strokeWidth="1.2"
    />
    <rect
      x="12"
      y="22"
      width="16"
      height="10"
      rx="1"
      stroke="white"
      strokeWidth="1.2"
    />
  </svg>
);

const hammerSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <rect
      x="16"
      y="4"
      width="12"
      height="8"
      rx="2"
      stroke="white"
      strokeWidth="1.2"
    />
    <line
      x1="22"
      y1="12"
      x2="22"
      y2="36"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const craneSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <line
      x1="10"
      y1="36"
      x2="10"
      y2="6"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="6"
      x2="34"
      y2="6"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="34"
      y1="6"
      x2="34"
      y2="16"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="36"
      x2="14"
      y2="36"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="20"
      x2="18"
      y2="6"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const helmetSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <path
      d="M8 24c0-8 5-14 12-14s12 6 12 14"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="4"
      y1="24"
      x2="36"
      y2="24"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="28"
      x2="34"
      y2="28"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const wrenchSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <path
      d="M28 6a8 8 0 0 0-11 11L9 25l6 6 8-8a8 8 0 0 0 5-17z"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const cementSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <rect
      x="8"
      y="14"
      width="24"
      height="20"
      rx="2"
      stroke="white"
      strokeWidth="1.2"
    />
    <path d="M8 20h24" stroke="white" strokeWidth="1" />
    <path
      d="M14 8h12l2 6H12l2-6z"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ruleSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <rect
      x="6"
      y="10"
      width="28"
      height="20"
      rx="1"
      stroke="white"
      strokeWidth="1.2"
    />
    <line x1="12" y1="10" x2="12" y2="18" stroke="white" strokeWidth="1" />
    <line x1="18" y1="10" x2="18" y2="15" stroke="white" strokeWidth="1" />
    <line x1="24" y1="10" x2="24" y2="18" stroke="white" strokeWidth="1" />
    <line x1="30" y1="10" x2="30" y2="15" stroke="white" strokeWidth="1" />
  </svg>
);

const gearSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <circle cx="20" cy="20" r="6" stroke="white" strokeWidth="1.2" />
    <circle
      cx="20"
      cy="20"
      r="12"
      stroke="white"
      strokeWidth="1.2"
      strokeDasharray="4 3"
    />
  </svg>
);

const sawSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <path
      d="M6 28L28 6"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M28 6l6 6-22 22-6-6z"
      stroke="white"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path d="M10 24l8-8" stroke="white" strokeWidth="1" />
  </svg>
);

const truckSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <rect
      x="3"
      y="12"
      width="20"
      height="16"
      rx="1"
      stroke="white"
      strokeWidth="1.2"
    />
    <path
      d="M23 18h8l4 6v4h-12v-10z"
      stroke="white"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="30" r="3" stroke="white" strokeWidth="1.2" />
    <circle cx="31" cy="30" r="3" stroke="white" strokeWidth="1.2" />
  </svg>
);

const wallSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <rect
      x="4"
      y="4"
      width="32"
      height="8"
      rx="1"
      stroke="white"
      strokeWidth="1"
    />
    <rect
      x="4"
      y="14"
      width="14"
      height="8"
      rx="1"
      stroke="white"
      strokeWidth="1"
    />
    <rect
      x="22"
      y="14"
      width="14"
      height="8"
      rx="1"
      stroke="white"
      strokeWidth="1"
    />
    <rect
      x="4"
      y="24"
      width="32"
      height="8"
      rx="1"
      stroke="white"
      strokeWidth="1"
    />
  </svg>
);

const pipeSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <path
      d="M8 8v12h10v12"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8h8M14 20h8M18 32h8"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const paintSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <rect
      x="6"
      y="6"
      width="22"
      height="12"
      rx="2"
      stroke="white"
      strokeWidth="1.2"
    />
    <path d="M14 18v4h6v-4" stroke="white" strokeWidth="1.2" />
    <path
      d="M17 22v12"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const beamSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <path
      d="M4 14h32M4 26h32"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M10 14v12M20 14v12M30 14v12"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M4 14l6-8h20l6 8"
      stroke="white"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const ladderSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <line
      x1="12"
      y1="4"
      x2="12"
      y2="36"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="4"
      x2="28"
      y2="36"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line x1="12" y1="10" x2="28" y2="10" stroke="white" strokeWidth="1" />
    <line x1="12" y1="18" x2="28" y2="18" stroke="white" strokeWidth="1" />
    <line x1="12" y1="26" x2="28" y2="26" stroke="white" strokeWidth="1" />
    <line x1="12" y1="34" x2="28" y2="34" stroke="white" strokeWidth="1" />
  </svg>
);

const boltSvg = (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <path
      d="M22 4L12 22h8l-4 14L30 18h-8l4-14z"
      stroke="white"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

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
        navigate("/responsable/mon-chantier");
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
      svg: craneSvg,
      anim: "drift1 9s ease-in-out infinite",
    },
    {
      top: "12%",
      left: "8%",
      w: 42,
      svg: brickSvg,
      anim: "drift2 11s ease-in-out infinite",
    },
    {
      top: "28%",
      right: "18%",
      w: 50,
      svg: helmetSvg,
      anim: "drift3 8s ease-in-out infinite",
    },
    {
      top: "55%",
      right: "6%",
      w: 45,
      svg: hammerSvg,
      anim: "drift4 10s ease-in-out infinite",
    },
    {
      bottom: "10%",
      right: "22%",
      w: 55,
      svg: wrenchSvg,
      anim: "drift5 7s ease-in-out infinite",
    },
    {
      bottom: "30%",
      left: "5%",
      w: 44,
      svg: cementSvg,
      anim: "drift1 12s ease-in-out infinite 1s",
    },
    {
      top: "6%",
      right: "38%",
      w: 32,
      svg: gearSvg,
      anim: "drift3 9s ease-in-out infinite 0.5s",
    },
    {
      top: "42%",
      left: "10%",
      w: 38,
      svg: ruleSvg,
      anim: "drift2 10s ease-in-out infinite 2s",
    },
    {
      bottom: "5%",
      left: "22%",
      w: 40,
      svg: brickSvg,
      anim: "drift5 11s ease-in-out infinite 1.5s",
    },
    {
      top: "72%",
      right: "14%",
      w: 35,
      svg: gearSvg,
      anim: "drift4 8s ease-in-out infinite 0.8s",
    },
    {
      top: "20%",
      right: "4%",
      w: 30,
      svg: boltSvg,
      anim: "drift1 7s ease-in-out infinite 1.2s",
    },
    {
      bottom: "45%",
      right: "32%",
      w: 34,
      svg: helmetSvg,
      anim: "drift2 9s ease-in-out infinite 2.5s",
    },
    {
      top: "5%",
      left: "28%",
      w: 48,
      svg: truckSvg,
      anim: "drift3 10s ease-in-out infinite 0.3s",
    },
    {
      top: "38%",
      right: "35%",
      w: 42,
      svg: wallSvg,
      anim: "drift5 8s ease-in-out infinite 1.8s",
    },
    {
      bottom: "18%",
      left: "15%",
      w: 36,
      svg: pipeSvg,
      anim: "drift4 11s ease-in-out infinite 0.6s",
    },
    {
      top: "65%",
      left: "6%",
      w: 50,
      svg: ladderSvg,
      anim: "drift1 9s ease-in-out infinite 2.2s",
    },
    {
      bottom: "3%",
      right: "8%",
      w: 38,
      svg: paintSvg,
      anim: "drift2 7s ease-in-out infinite 1.4s",
    },
    {
      top: "85%",
      left: "30%",
      w: 32,
      svg: sawSvg,
      anim: "drift3 10s ease-in-out infinite 0.9s",
    },
    {
      top: "15%",
      right: "25%",
      w: 28,
      svg: beamSvg,
      anim: "drift5 12s ease-in-out infinite 1.7s",
    },
    {
      bottom: "55%",
      left: "25%",
      w: 30,
      svg: wrenchSvg,
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
              {ic.svg}
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
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
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
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
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
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
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
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
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
                    Connexion en cours...
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
