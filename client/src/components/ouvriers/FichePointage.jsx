import React, { useState, useRef, useMemo, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/SvgIcons";
import { useGetOuvriersQuery } from "../../services/ouvrierApiSlice";
import {
  useGetPointagesQuery,
  useSetPointageMutation,
  useSupprimerPointageMutation,
} from "../../services/pointageApiSlice";
import { useGetChantiersQuery } from "../../services/chantierApiSlice";
import { useGetResponsablesQuery } from "../../services/responsableApiSlice";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Hauteurs fixes pour synchroniser les 3 zones                              */
/* ═══════════════════════════════════════════════════════════════════════════ */
const H_HEAD = 48;
const H_ROW = 42;

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CellulePointage — dropdown position:fixed                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */
const CellulePointage = ({
  personne,
  jour,
  pointageMap,
  chantiers,
  onPointage,
  onSupprimer,
  abreviation,
}) => {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);

  const key = `${personne.id}-${jour.date}`;
  const currentPointage = pointageMap[key];
  const hasPointage = currentPointage !== undefined;
  const chantier = currentPointage?.chantier;
  const isDemi = currentPointage?.demiJournee;

  let bgColor = "transparent";
  let textColor = "#d1d5db";
  if (hasPointage) {
    if (!chantier) {
      bgColor = "#e5e7eb";
      textColor = "#6b7280";
    } else if (isDemi) {
      bgColor = "#f59e0b";
      textColor = "white";
    } else {
      bgColor = "#dc5539";
      textColor = "white";
    }
  }
  let displayText = "\u00b7";
  if (hasPointage)
    displayText = chantier ? abreviation(chantier.nom) : "\u2715";

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      let left = rect.left + rect.width / 2 - 65;
      if (left + 130 > window.innerWidth) left = window.innerWidth - 136;
      if (left < 4) left = 4;
      const spaceBelow = window.innerHeight - rect.bottom - 4;
      const spaceAbove = rect.top - 4;
      const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;
      setDropPos({
        top: openUp ? undefined : rect.bottom + 2,
        bottom: openUp ? window.innerHeight - rect.top + 2 : undefined,
        left,
      });
    }
    setOpen((o) => !o);
    setHover(null);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        (!btnRef.current || !btnRef.current.contains(e.target)) &&
        (!dropRef.current || !dropRef.current.contains(e.target))
      ) {
        setOpen(false);
        setHover(null);
      }
    };
    const onScroll = () => {
      setOpen(false);
      setHover(null);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  return (
    <div
      style={{
        width: 42,
        minWidth: 42,
        height: H_ROW,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: jour.dimanche ? "#fee2e2" : "transparent",
        flexShrink: 0,
      }}
    >
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          width: 32,
          height: 22,
          borderRadius: 4,
          fontWeight: 700,
          fontSize: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundColor: bgColor,
          color: textColor,
          border: "none",
          outline: "none",
        }}
      >
        {displayText}
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: dropPos.top,
            bottom: dropPos.bottom,
            left: dropPos.left,
            minWidth: 155,
            zIndex: 9999,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "4px 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <button
            onClick={() => {
              onSupprimer(personne, jour.date);
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "5px 12px",
              fontSize: 11,
              color: "#9ca3af",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              background: "none",
              textAlign: "left",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "#e5e7eb",
                flexShrink: 0,
              }}
            />
            Vider
          </button>

          {chantiers.map((c) => (
            <div
              key={c._id}
              style={{ position: "relative" }}
              onMouseEnter={() => setHover(c._id)}
              onMouseLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setHover(null);
              }}
            >
              <div
                style={{
                  width: "100%",
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: "#dc5539",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      maxWidth: 90,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.nom}
                  </span>
                </span>
                <span style={{ flexShrink: 0, display: "inline-flex" }}>
                  <ChevronRightIcon width={10} height={10} color="#9ca3af" />
                </span>
              </div>
              {hover === c._id && (
                <div
                  style={{
                    position: "absolute",
                    left: "100%",
                    top: 0,
                    minWidth: 148,
                    zIndex: 10000,
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "4px 0",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  }}
                >
                  <button
                    onClick={() => {
                      onPointage(personne, jour.date, c._id, false);
                      setOpen(false);
                      setHover(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: "none",
                      background: "none",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        backgroundColor: "#dc5539",
                        flexShrink: 0,
                      }}
                    />
                    Journée complète
                  </button>
                  <button
                    onClick={() => {
                      onPointage(personne, jour.date, c._id, true);
                      setOpen(false);
                      setHover(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: "none",
                      background: "none",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        backgroundColor: "#f59e0b",
                        flexShrink: 0,
                      }}
                    />
                    Demi journée
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              onPointage(personne, jour.date, null, false);
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "5px 12px",
              fontSize: 11,
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              background: "none",
              textAlign: "left",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "#d1d5db",
                flexShrink: 0,
              }}
            />
            Absent
          </button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Composant principal                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
const FichePointage = () => {
  const now = new Date();
  const [mois, setMois] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );

  const { data: ouvriers = [] } = useGetOuvriersQuery();
  const { data: responsables = [] } = useGetResponsablesQuery();
  const { data: chantiers = [] } = useGetChantiersQuery();
  const { data: pointages = [] } = useGetPointagesQuery(mois);
  const [setPointage] = useSetPointageMutation();
  const [supprimerPointage] = useSupprimerPointageMutation();

  const jours = useMemo(() => {
    const [annee, m] = mois.split("-").map(Number);
    const nbJours = new Date(annee, m, 0).getDate();
    const result = [];
    for (let i = 1; i <= nbJours; i++) {
      const date = new Date(annee, m - 1, i);
      result.push({
        jour: i,
        date: `${annee}-${String(m).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        dimanche: date.getDay() === 0,
        jourNom: date
          .toLocaleDateString("fr-FR", { weekday: "short" })
          .substring(0, 2),
      });
    }
    return result;
  }, [mois]);

  /* semaines 1-based (debut=1 signifie jours[0]) pour compatibilité */
  const semaines = useMemo(() => {
    const [annee, m] = mois.split("-").map(Number);
    const result = [];
    let semaineDebut = 1;
    for (let i = 1; i <= jours.length; i++) {
      const date = new Date(annee, m - 1, i);
      if (date.getDay() === 6 || i === jours.length) {
        result.push({ debut: semaineDebut, fin: i });
        semaineDebut = i + 1;
      }
    }
    return result;
  }, [jours, mois]);

  const personnes = useMemo(() => {
    const list = [];
    ouvriers
      .filter((o) => o.statut === "Actif")
      .forEach((o) => {
        list.push({
          id: o._id,
          nom: o.nom,
          prenom: o.prenom,
          tarif: o.tarifJournalier,
          type: "ouvrier",
        });
      });
    responsables.forEach((r) => {
      list.push({
        id: r._id,
        nom: r.nom,
        prenom: r.prenom,
        tarif: r.tarifJournalier || 0,
        type: "responsable",
      });
    });
    return list;
  }, [ouvriers, responsables]);

  const pointageMap = useMemo(() => {
    const map = {};
    pointages.forEach((p) => {
      const personneId = p.ouvrier?._id || p.responsable?._id;
      map[`${personneId}-${p.date}`] = p;
    });
    return map;
  }, [pointages]);

  const abreviation = (nom) => {
    if (!nom) return "";
    const mots = nom.trim().split(/\s+/);
    if (mots.length >= 2)
      return mots
        .slice(0, 3)
        .map((m) => m[0])
        .join("")
        .toUpperCase();
    return nom.substring(0, 2).toUpperCase();
  };

  const getChantiersForPersonne = (personne) => {
    if (personne.type === "responsable")
      return chantiers.filter(
        (c) => String(c.responsable?._id || c.responsable) === personne.id,
      );
    return chantiers;
  };

  const centerRef = useRef(null);

  const handlePointage = async (personne, date, chantierId, demiJournee) => {
    const data = { date };
    if (personne.type === "ouvrier") data.ouvrierId = personne.id;
    else data.responsableId = personne.id;
    data.chantierId = chantierId;
    data.demiJournee = demiJournee;
    await setPointage(data);
  };

  const handleSupprimerPointage = async (personne, date) => {
    const data = { date };
    if (personne.type === "ouvrier") data.ouvrierId = personne.id;
    else data.responsableId = personne.id;
    await supprimerPointage(data);
  };

  const calculerTotalSemaine = (personne, semaine) => {
    let totalJours = 0;
    for (let j = semaine.debut; j <= semaine.fin; j++) {
      const date = jours[j - 1]?.date;
      const pointage = pointageMap[`${personne.id}-${date}`];
      if (pointage?.chantier) totalJours += pointage.demiJournee ? 0.5 : 1;
    }
    return totalJours * personne.tarif;
  };

  const [anneeAff, moisAff] = mois.split("-").map(Number);
  const nomMois = new Date(anneeAff, moisAff - 1, 15).toLocaleDateString(
    "fr-FR",
    { month: "long", year: "numeric" },
  );

  const prevMois = () => {
    const [a, m] = mois.split("-").map(Number);
    setMois(m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, "0")}`);
  };
  const nextMois = () => {
    const [a, m] = mois.split("-").map(Number);
    setMois(
      m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`,
    );
  };

  const scrollToToday = () => {
    const el = centerRef.current?.querySelector(
      `[data-jour="${new Date().getDate()}"]`,
    );
    if (el)
      el.scrollIntoView({
        inline: "center",
        behavior: "smooth",
        block: "nearest",
      });
  };
  const scrollToSemaine = (i) => {
    const s = semaines[i];
    if (s) {
      const el = centerRef.current?.querySelector(`[data-jour="${s.debut}"]`);
      if (el)
        el.scrollIntoView({
          inline: "start",
          behavior: "smooth",
          block: "nearest",
        });
    }
  };

  /* Jours groupés par semaine pour les séparateurs visuels dans la zone centre */
  const joursSemaine = useMemo(() => {
    return semaines.map((s) => {
      const list = [];
      for (let j = s.debut; j <= s.fin; j++) {
        list.push(jours[j - 1]);
      }
      return list;
    });
  }, [semaines, jours]);

  /* Largeur totale forcée = cellules + séparateurs → force le débordement et affiche la scrollbar */
  const totalWidth = jours.length * 42 + (joursSemaine.length - 1) * 2 + 1;
  const semainesWidth = semaines.length * 68;

  return (
    <div>
      {/* ── Header navigation ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMois}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeftIcon width={16} height={16} color="currentColor" />
          </button>
          <h3
            className="text-lg font-bold text-gray-800 min-w-[180px] text-center"
            style={{ textTransform: "capitalize" }}
          >
            {nomMois}
          </h3>
          <button
            onClick={nextMois}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronRightIcon width={16} height={16} color="currentColor" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={scrollToToday}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-white"
            style={{ backgroundColor: "#dc5539" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#c44a30")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc5539")
            }
          >
            Aujourd'hui
          </button>
          {semaines.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSemaine(i)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              S{i + 1}
            </button>
          ))}
          <button
            onClick={() => {
              const n = new Date();
              setMois(
                `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`,
              );
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Mois actuel
          </button>
        </div>
      </div>

      {/* ── Légende ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 flex-wrap">
        {chantiers.map((c) => (
          <span key={c._id} className="flex items-center gap-1.5">
            <span
              className="px-1.5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: "#dc5539" }}
            >
              {abreviation(c.nom)}
            </span>
            {c.nom}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span
            className="px-1.5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: "#f59e0b" }}
          >
            DJ
          </span>
          Demi journée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 h-5 rounded text-[9px] font-bold flex items-center justify-center bg-gray-200 text-gray-500">
            ✕
          </span>
          Absent
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           TABLEAU 3 ZONES :  NOMS (fixe) | DATES (scroll) | SEMAINES (fixe)
         ══════════════════════════════════════════════════════════════════ */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ display: "flex" }}
      >
        {/* ════ ZONE GAUCHE : Noms (fixe, ne scroll pas) ════ */}
        <div
          style={{
            flexShrink: 0,
            width: 175,
            borderRight: "2px solid #e5e7eb",
            backgroundColor: "white",
            zIndex: 2,
          }}
        >
          {/* Header */}
          <div
            style={{
              height: H_HEAD,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              fontWeight: 600,
              fontSize: 12,
              color: "#4b5563",
              borderBottom: "1px solid #e5e7eb",
              boxSizing: "border-box",
            }}
          >
            Nom & Prénom
          </div>
          {/* Lignes */}
          {personnes.length === 0 ? (
            <div
              style={{
                height: H_ROW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              Aucun
            </div>
          ) : (
            personnes.map((p) => (
              <div
                key={p.id}
                style={{
                  height: H_ROW,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  borderBottom: "1px solid #f3f4f6",
                  boxSizing: "border-box",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 700,
                    flexShrink: 0,
                    backgroundColor:
                      p.type === "responsable" ? "#2563eb" : "#dc5539",
                  }}
                >
                  {p.prenom?.[0]}
                  {p.nom?.[0]}
                </div>
                <span
                  style={{
                    fontWeight: 500,
                    color: "#1f2937",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.prenom} {p.nom}
                </span>
                {p.type === "responsable" && (
                  <span
                    style={{
                      fontSize: 9,
                      padding: "2px 6px",
                      borderRadius: 999,
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    R
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* ════ ZONE CENTRE : Dates (scrollbar horizontal ICI) ════ */}
        <div
          ref={centerRef}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            width: 0,
            flex: "1 0 0px",
          }}
        >
          {/* Header des jours */}
          <div
            style={{
              display: "flex",
              minWidth: totalWidth + "px",
              height: H_HEAD,
              borderBottom: "1px solid #e5e7eb",
              boxSizing: "border-box",
            }}
          >
            {joursSemaine.map((js, si) => (
              <React.Fragment key={`sh${si}`}>
                {js.map((j) => (
                  <div
                    key={j.jour}
                    data-jour={j.jour}
                    style={{
                      width: 42,
                      minWidth: 42,
                      height: H_HEAD,
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 500,
                      fontSize: 9,
                      color: j.dimanche ? "#dc2626" : "#6b7280",
                      backgroundColor: j.dimanche
                        ? "#fee2e2"
                        : si % 2 === 0
                          ? "white"
                          : "#fafafa",
                      boxSizing: "border-box",
                    }}
                  >
                    <div>{j.jourNom}</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 10,
                        color: j.dimanche ? "#dc2626" : "#374151",
                      }}
                    >
                      {j.jour}
                    </div>
                  </div>
                ))}
                {/* Séparateur entre semaines */}
                {si < joursSemaine.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      minWidth: 2,
                      flexShrink: 0,
                      backgroundColor: "#d1d5db",
                      height: H_HEAD,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Lignes des cellules */}
          {personnes.length === 0 ? (
            <div
              style={{
                height: H_ROW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              –
            </div>
          ) : (
            personnes.map((p) => {
              const chantiersP = getChantiersForPersonne(p);
              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    minWidth: totalWidth + "px",
                    height: H_ROW,
                    borderBottom: "1px solid #f3f4f6",
                    boxSizing: "border-box",
                  }}
                >
                  {joursSemaine.map((js, si) => (
                    <React.Fragment key={`sr${si}`}>
                      {js.map((j) => (
                        <CellulePointage
                          key={j.jour}
                          personne={p}
                          jour={j}
                          pointageMap={pointageMap}
                          chantiers={chantiersP}
                          onPointage={handlePointage}
                          onSupprimer={handleSupprimerPointage}
                          abreviation={abreviation}
                        />
                      ))}
                      {si < joursSemaine.length - 1 && (
                        <div
                          style={{
                            width: 2,
                            minWidth: 2,
                            flexShrink: 0,
                            backgroundColor: "#d1d5db",
                            height: H_ROW,
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* ════ ZONE DROITE : Semaines (fixe, ne scroll pas) ════ */}
        <div
          style={{
            flexShrink: 0,
            borderLeft: "2px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            zIndex: 2,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              height: H_HEAD,
              borderBottom: "1px solid #e5e7eb",
              boxSizing: "border-box",
            }}
          >
            {semaines.map((s, i) => (
              <div
                key={i}
                style={{
                  width: 68,
                  minWidth: 68,
                  height: H_HEAD,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 11,
                  color: "#4b5563",
                  boxSizing: "border-box",
                }}
              >
                <div>S{i + 1}</div>
                <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 400 }}>
                  {jours[s.debut - 1]?.jour}–{jours[s.fin - 1]?.jour}
                </div>
              </div>
            ))}
          </div>
          {/* Lignes */}
          {personnes.length === 0 ? (
            <div
              style={{
                height: H_ROW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              –
            </div>
          ) : (
            personnes.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  height: H_ROW,
                  borderBottom: "1px solid #f3f4f6",
                  boxSizing: "border-box",
                }}
              >
                {semaines.map((s, i) => {
                  const total = calculerTotalSemaine(p, s);
                  return (
                    <div
                      key={i}
                      style={{
                        width: 68,
                        minWidth: 68,
                        height: H_ROW,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 11,
                        color: total > 0 ? "#1f2937" : "#d1d5db",
                        boxSizing: "border-box",
                      }}
                    >
                      {total > 0 ? `${total} DT` : "\u2014"}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FichePointage;
