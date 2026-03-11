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
  isActiveWeek,
  isToday,
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

  const cellBg = jour.dimanche
    ? "#fee2e2"
    : isToday
      ? "#eff6ff"
      : isActiveWeek
        ? "#fff5f3"
        : "transparent";

  return (
    <div
      style={{
        width: 42,
        minWidth: 42,
        height: H_ROW,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: cellBg,
        flexShrink: 0,
        transition: "background-color 0.2s",
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
  const [activeSemaine, setActiveSemaine] = useState(null);

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

  /* semaines 1-based */
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

  /* Jours groupés par semaine */
  const joursSemaine = useMemo(() => {
    return semaines.map((s) => {
      const list = [];
      for (let j = s.debut; j <= s.fin; j++) {
        list.push(jours[j - 1]);
      }
      return list;
    });
  }, [semaines, jours]);

  /* Offset x de chaque semaine dans la zone scrollable */
  const semaineOffsets = useMemo(() => {
    const offsets = [];
    let x = 0;
    joursSemaine.forEach((js, i) => {
      offsets.push(x);
      x += js.length * 42;
      if (i < joursSemaine.length - 1) x += 2; // séparateur
    });
    return offsets;
  }, [joursSemaine]);

  /* Auto-sélectionner la semaine du jour courant au chargement */
  useEffect(() => {
    const today = new Date();
    const todayMois = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    if (mois === todayMois) {
      const todayDay = today.getDate();
      const idx = semaines.findIndex(
        (s) => s.debut <= todayDay && s.fin >= todayDay,
      );
      setActiveSemaine(idx >= 0 ? idx : 0);
    } else {
      setActiveSemaine(0);
    }
  }, [mois, semaines]);

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
  const isProgrammaticScroll = useRef(false);

  /* Aujourd'hui en chaîne YYYY-MM-DD */
  const todayDateStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }, []);

  /* Scroll → met à jour la semaine active (ignoré pendant un scroll programmatique) */
  const handleCenterScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (!centerRef.current || semaineOffsets.length === 0) return;
    const { scrollLeft, clientWidth } = centerRef.current;
    const center = scrollLeft + clientWidth / 2;
    let found = 0;
    for (let i = semaineOffsets.length - 1; i >= 0; i--) {
      if (center >= semaineOffsets[i]) {
        found = i;
        break;
      }
    }
    setActiveSemaine(found);
  };

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

  const scrollToSemaine = (i, newActive = true) => {
    const s = semaines[i];
    if (s) {
      isProgrammaticScroll.current = true;
      const el = centerRef.current?.querySelector(`[data-jour="${s.debut}"]`);
      if (el)
        el.scrollIntoView({
          inline: "start",
          behavior: "smooth",
          block: "nearest",
        });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 700);
    }
    if (newActive) setActiveSemaine(i);
  };

  const scrollToToday = () => {
    const today = new Date();
    const todayMois = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    if (mois !== todayMois) {
      setMois(todayMois);
      return;
    }
    isProgrammaticScroll.current = true;
    const el = centerRef.current?.querySelector(
      `[data-jour="${today.getDate()}"]`,
    );
    if (el)
      el.scrollIntoView({
        inline: "center",
        behavior: "smooth",
        block: "nearest",
      });
    const todayDay = today.getDate();
    const idx = semaines.findIndex(
      (s) => s.debut <= todayDay && s.fin >= todayDay,
    );
    if (idx >= 0) setActiveSemaine(idx);
    setTimeout(() => { isProgrammaticScroll.current = false; }, 700);
  };

  /* Largeur totale */
  const totalWidth = jours.length * 42 + (joursSemaine.length - 1) * 2 + 1;

  /* Style commun pour les boutons de navigation */
  const activeNavBtn = {
    backgroundColor: "#dc5539",
    color: "white",
    border: "none",
  };
  const inactiveNavBtn = {
    backgroundColor: "white",
    color: "#4b5563",
    border: "1px solid #e5e7eb",
  };

  return (
    <div>
      {/* ── Header navigation ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Sélecteur de mois */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMois}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeftIcon width={16} height={16} color="currentColor" />
          </button>
          <h3
            className="text-base sm:text-lg font-bold text-gray-800 min-w-35 sm:min-w-45 text-center"
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

        {/* Raccourcis semaines — scrollable horizontalement sur mobile */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            onClick={scrollToToday}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors"
            style={activeSemaine === 1 ? activeNavBtn : inactiveNavBtn}
          >
            Aujourd'hui
          </button>
          {semaines.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSemaine(i)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors"
              style={activeSemaine === i ? activeNavBtn : inactiveNavBtn}
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
            className="px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0"
            style={inactiveNavBtn}
          >
            Mois actuel
          </button>
        </div>
      </div>

      {/* ── Légende ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 mb-3 text-xs text-gray-500 flex-wrap overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {chantiers.map((c) => (
          <span key={c._id} className="flex items-center gap-1.5 shrink-0">
            <span
              className="px-1.5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: "#dc5539" }}
            >
              {abreviation(c.nom)}
            </span>
            {c.nom}
          </span>
        ))}
        <span className="flex items-center gap-1.5 shrink-0">
          <span
            className="px-1.5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: "#f59e0b" }}
          >
            DJ
          </span>
          Demi journée
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="px-1.5 h-5 rounded text-[9px] font-bold flex items-center justify-center bg-gray-200 text-gray-500">
            ✕
          </span>
          Absent
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           MOBILE : cartes par personne (semaine active seulement)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="block sm:hidden space-y-3">
        {personnes.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-6">
            Aucun ouvrier actif
          </p>
        ) : (
          personnes.map((p) => {
            const chantiersP = getChantiersForPersonne(p);
            const semaineActive = semaines[activeSemaine] ?? semaines[0];
            const joursActifs = semaineActive
              ? (joursSemaine[activeSemaine] ?? [])
              : [];
            const total = semaineActive
              ? calculerTotalSemaine(p, semaineActive)
              : 0;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{
                        backgroundColor:
                          p.type === "responsable" ? "#2563eb" : "#dc5539",
                      }}
                    >
                      {p.prenom?.[0]}
                      {p.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {p.prenom} {p.nom}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {p.type === "responsable" ? "Responsable" : "Ouvrier"} ·{" "}
                        {p.tarif} DT/j
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: total > 0 ? "#dc5539" : "#d1d5db" }}
                    >
                      {total > 0 ? `${total} DT` : "—"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      S{(activeSemaine ?? 0) + 1} · {semaineActive?.debut}–
                      {semaineActive?.fin}
                    </p>
                  </div>
                </div>
                {/* Days grid */}
                <div
                  className="flex items-end px-3 py-3 gap-1.5 overflow-x-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {joursActifs.map((j) => (
                    <div
                      key={j.jour}
                      className="flex flex-col items-center gap-1 shrink-0"
                      style={{ minWidth: 38 }}
                    >
                      <span
                        className="text-[9px] font-medium uppercase"
                        style={{ color: j.date === todayDateStr ? "#2563eb" : j.dimanche ? "#dc2626" : "#9ca3af" }}
                      >
                        {j.jourNom}
                      </span>
                      <span
                        className="text-[10px] font-bold flex items-center justify-center rounded-full"
                        style={{
                          width: 18,
                          height: 18,
                          backgroundColor: j.date === todayDateStr ? "#2563eb" : "transparent",
                          color: j.date === todayDateStr ? "white" : j.dimanche ? "#dc2626" : "#374151",
                        }}
                      >
                        {j.jour}
                      </span>
                      <CellulePointage
                        personne={p}
                        jour={j}
                        pointageMap={pointageMap}
                        chantiers={chantiersP}
                        onPointage={handlePointage}
                        onSupprimer={handleSupprimerPointage}
                        abreviation={abreviation}
                        isActiveWeek={false}
                        isToday={j.date === todayDateStr}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           DESKTOP : TABLEAU 3 ZONES : NOMS | DATES (scroll) | SEMAINES
         ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden sm:flex bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* ════ ZONE GAUCHE : Noms (fixe) ════ */}
        <div
          style={{
            flexShrink: 0,
            width: 150,
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
                  padding: "0 10px",
                  borderBottom: "1px solid #f3f4f6",
                  boxSizing: "border-box",
                  gap: 7,
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
                    fontSize: 11,
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
                      padding: "2px 5px",
                      borderRadius: 999,
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: 600,
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

        {/* ════ ZONE CENTRE : Dates (scrollbar horizontal) ════ */}
        <div
          ref={centerRef}
          onScroll={handleCenterScroll}
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
                        : j.date === todayDateStr
                          ? "#eff6ff"
                          : si === activeSemaine
                            ? "#fff5f3"
                            : si % 2 === 0
                              ? "white"
                              : "#fafafa",
                      boxSizing: "border-box",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <div style={{ color: j.date === todayDateStr ? "#2563eb" : j.dimanche ? "#dc2626" : "#6b7280" }}>
                      {j.jourNom}
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 10,
                        backgroundColor: j.date === todayDateStr ? "#2563eb" : "transparent",
                        color: j.date === todayDateStr
                          ? "white"
                          : j.dimanche
                            ? "#dc2626"
                            : si === activeSemaine
                              ? "#dc5539"
                              : "#374151",
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
                      backgroundColor:
                        si === activeSemaine || si + 1 === activeSemaine
                          ? "#dc5539"
                          : "#d1d5db",
                      height: H_HEAD,
                      transition: "background-color 0.2s",
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
                          isActiveWeek={si === activeSemaine}
                          isToday={j.date === todayDateStr}
                        />
                      ))}
                      {si < joursSemaine.length - 1 && (
                        <div
                          style={{
                            width: 2,
                            minWidth: 2,
                            flexShrink: 0,
                            backgroundColor:
                              si === activeSemaine || si + 1 === activeSemaine
                                ? "#dc5539"
                                : "#d1d5db",
                            height: H_ROW,
                            transition: "background-color 0.2s",
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

        {/* ════ ZONE DROITE : Semaines (fixe) ════ */}
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
                onClick={() => scrollToSemaine(i)}
                style={{
                  width: 64,
                  minWidth: 64,
                  height: H_HEAD,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: "pointer",
                  color: i === activeSemaine ? "#dc5539" : "#4b5563",
                  backgroundColor:
                    i === activeSemaine ? "#fff5f3" : "transparent",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                  borderBottom:
                    i === activeSemaine
                      ? "2px solid #dc5539"
                      : "2px solid transparent",
                }}
              >
                <div>S{i + 1}</div>
                <div
                  style={{
                    fontSize: 8,
                    color: i === activeSemaine ? "#dc5539" : "#9ca3af",
                    fontWeight: 400,
                  }}
                >
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
                        width: 64,
                        minWidth: 64,
                        height: H_ROW,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 11,
                        color:
                          i === activeSemaine && total > 0
                            ? "#dc5539"
                            : total > 0
                              ? "#1f2937"
                              : "#d1d5db",
                        backgroundColor:
                          i === activeSemaine ? "#fff5f3" : "transparent",
                        boxSizing: "border-box",
                        transition: "all 0.2s",
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
