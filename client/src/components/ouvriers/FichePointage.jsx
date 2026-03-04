import React, { useState, useRef, useMemo, useEffect } from "react";
import { useGetOuvriersQuery } from "../../services/ouvrierApiSlice";
import {
  useGetPointagesQuery,
  useSetPointageMutation,
  useSupprimerPointageMutation,
} from "../../services/pointageApiSlice";
import { useGetChantiersQuery } from "../../services/chantierApiSlice";
import { useGetResponsablesQuery } from "../../services/responsableApiSlice";

// ─── Cellule avec dropdown position:fixed (évite le clipping) ─────────────────
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

  let displayText = "·";
  if (hasPointage) {
    displayText = chantier ? abreviation(chantier.nom) : "✕";
  }

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 2, left: rect.left });
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
    // Close on scroll to avoid stale position
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
    <div>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-8 h-5 rounded font-bold flex items-center justify-center focus:outline-none"
        style={{ backgroundColor: bgColor, color: textColor, fontSize: "8px" }}
      >
        {displayText}
      </button>

      {open && (
        <div
          ref={dropRef}
          className="bg-white rounded-lg border border-gray-100 shadow-lg py-1"
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            minWidth: "158px",
            zIndex: 9999,
          }}
        >
          {/* Vider */}
          <button
            className="w-full px-3 py-1.5 text-left text-[11px] text-gray-500 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              onSupprimer(personne, jour.date);
              setOpen(false);
            }}
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: "#e5e7eb" }}
            />
            Vider
          </button>

          {/* Chantiers */}
          {chantiers.map((c) => (
            <div
              key={c._id}
              className="relative"
              onMouseEnter={() => setHover(c._id)}
              onMouseLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setHover(null);
              }}
            >
              <div className="w-full px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-1 cursor-pointer select-none">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: "#dc5539" }}
                  />
                  <span className="truncate" style={{ maxWidth: "95px" }}>
                    {c.nom}
                  </span>
                </div>
                <svg
                  width="10"
                  height="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="text-gray-300 shrink-0"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>

              {hover === c._id && (
                <div
                  className="absolute left-full top-0 bg-white rounded-lg border border-gray-100 shadow-lg py-1"
                  style={{ minWidth: "148px", zIndex: 10000 }}
                >
                  <button
                    className="w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      onPointage(personne, jour.date, c._id, false);
                      setOpen(false);
                      setHover(null);
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: "#dc5539" }}
                    />
                    Journée complete
                  </button>
                  <button
                    className="w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      onPointage(personne, jour.date, c._id, true);
                      setOpen(false);
                      setHover(null);
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: "#f59e0b" }}
                    />
                    Demi journee
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Absent */}
          <button
            className="w-full px-3 py-1.5 text-left text-[11px] text-gray-500 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              onPointage(personne, jour.date, null, false);
              setOpen(false);
            }}
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: "#d1d5db" }}
            />
            Absent
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
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
    if (mots.length >= 2) {
      return mots
        .slice(0, 3)
        .map((m) => m[0])
        .join("")
        .toUpperCase();
    }
    return nom.substring(0, 2).toUpperCase();
  };

  // Responsable voit uniquement son chantier
  const getChantiersForPersonne = (personne) => {
    if (personne.type === "responsable") {
      return chantiers.filter(
        (c) => String(c.responsable?._id || c.responsable) === personne.id,
      );
    }
    return chantiers;
  };

  const tableRef = useRef(null);

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
      if (pointage?.chantier) {
        totalJours += pointage.demiJournee ? 0.5 : 1;
      }
    }
    return totalJours * personne.tarif;
  };

  const [anneeAff, moisAff] = mois.split("-").map(Number);
  const nomMois = new Date(anneeAff, moisAff - 1, 15).toLocaleDateString(
    "fr-FR",
    { month: "long", year: "numeric" },
  );

  const scrollToToday = () => {
    const todayNum = new Date().getDate();
    if (tableRef.current) {
      const th = tableRef.current.querySelector(`[data-jour="${todayNum}"]`);
      if (th) th.scrollIntoView({ inline: "center", behavior: "smooth" });
    }
  };

  const scrollToSemaine = (semaineIndex) => {
    if (tableRef.current) {
      const s = semaines[semaineIndex];
      if (s) {
        const th = tableRef.current.querySelector(`[data-jour="${s.debut}"]`);
        if (th) th.scrollIntoView({ inline: "start", behavior: "smooth" });
      }
    }
  };

  const totalThStyle = (si) => ({
    minWidth: "52px",
    backgroundColor: "#f3f4f6",
    borderLeft: "1px solid #e5e7eb",
    borderRight: si < semaines.length - 1 ? "2px solid #d1d5db" : "none",
  });

  const totalTdStyle = (si, total) => ({
    backgroundColor: "#f3f4f6",
    borderLeft: "1px solid #e5e7eb",
    borderRight: si < semaines.length - 1 ? "2px solid #d1d5db" : "none",
    color: total > 0 ? "#1f2937" : "#9ca3af",
  });

  return (
    <div>
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const [a, m] = mois.split("-").map(Number);
              setMois(
                m === 1
                  ? `${a - 1}-12`
                  : `${a}-${String(m - 1).padStart(2, "0")}`,
              );
            }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h3
            className="text-lg font-bold text-gray-800 min-w-[180px] text-center"
            style={{ textTransform: "capitalize" }}
          >
            {nomMois}
          </h3>
          <button
            onClick={() => {
              const [a, m] = mois.split("-").map(Number);
              setMois(
                m === 12
                  ? `${a + 1}-01`
                  : `${a}-${String(m + 1).padStart(2, "0")}`,
              );
            }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={scrollToToday}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-white"
            style={{ backgroundColor: "#dc5539" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#c44a30")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc5539")}
          >
            Aujourd'hui
          </button>
          {semaines.map((s, i) => (
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

      {/* Légende — une seule abréviation par chantier */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        {chantiers.map((c) => (
          <span key={c._id} className="flex items-center gap-1.5">
            <span
              className="w-6 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: "#dc5539" }}
            >
              {abreviation(c.nom)}
            </span>
            {c.nom}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-5 rounded text-[9px] font-bold flex items-center justify-center bg-gray-200 text-gray-500">
            ✕
          </span>
          Absent
        </span>
      </div>

      {/* Tableau — scroll horizontal uniquement (Nom sticky gauche) */}
      <div
        ref={tableRef}
        className="bg-white rounded-2xl border border-gray-100"
        style={{ overflowX: "auto" }}
      >
        <table className="text-xs" style={{ minWidth: "max-content" }}>
          <thead className="sticky top-0 bg-white" style={{ zIndex: 40 }}>
            <tr className="border-b border-gray-100">
              {/* Colonne Nom — sticky left */}
              <th
                className="sticky left-0 bg-white text-left px-3 py-2 font-semibold text-gray-600"
                style={{
                  minWidth: "155px",
                  zIndex: 50,
                  boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
                }}
              >
                Nom & Prénom
              </th>

              {/* Semaines inline */}
              {semaines.flatMap((s, si) => [
                ...jours.slice(s.debut - 1, s.fin).map((j) => (
                  <th
                    key={j.jour}
                    data-jour={j.jour}
                    className="py-1 text-center font-semibold"
                    style={{
                      minWidth: "34px",
                      width: "34px",
                      color: j.dimanche ? "#dc2626" : "#6b7280",
                      backgroundColor: j.dimanche
                        ? "#fee2e2"
                        : si % 2 === 0
                          ? "white"
                          : "#fafafa",
                    }}
                  >
                    <div style={{ fontSize: "9px" }}>{j.jourNom}</div>
                    <div style={{ fontSize: "9px" }}>{j.jour}</div>
                  </th>
                )),
                <th
                  key={`s${si}`}
                  className="py-1 text-center font-semibold text-gray-500"
                  style={{ ...totalThStyle(si), fontSize: "9px" }}
                >
                  S{si + 1}
                </th>,
              ])}
            </tr>
          </thead>

          <tbody>
            {personnes.length === 0 ? (
              <tr>
                <td
                  colSpan={jours.length + semaines.length + 1}
                  className="text-center py-8 text-sm text-gray-400"
                >
                  Aucun ouvrier ou responsable
                </td>
              </tr>
            ) : (
              personnes.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  {/* Colonne Nom — sticky left */}
                  <td
                    className="sticky left-0 bg-white px-3 py-1.5"
                    style={{
                      zIndex: 10,
                      boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{
                          backgroundColor:
                            p.type === "responsable" ? "#2563eb" : "#dc5539",
                        }}
                      >
                        {p.prenom?.[0]}
                        {p.nom?.[0]}
                      </div>
                      <span className="font-medium text-gray-800 whitespace-nowrap text-xs">
                        {p.prenom} {p.nom}
                      </span>
                      {p.type === "responsable" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium shrink-0">
                          R
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Semaines inline */}
                  {semaines.flatMap((s, si) => {
                    const total = calculerTotalSemaine(p, s);
                    return [
                      ...jours.slice(s.debut - 1, s.fin).map((j) => (
                        <td
                          key={j.jour}
                          className="text-center"
                          style={{
                            padding: "2px 1px",
                            backgroundColor: j.dimanche
                              ? "#fee2e2"
                              : si % 2 === 0
                                ? "transparent"
                                : "#fafafa",
                          }}
                        >
                          <CellulePointage
                            personne={p}
                            jour={j}
                            pointageMap={pointageMap}
                            chantiers={getChantiersForPersonne(p)}
                            onPointage={handlePointage}
                            onSupprimer={handleSupprimerPointage}
                            abreviation={abreviation}
                          />
                        </td>
                      )),
                      <td
                        key={`s${si}`}
                        className="px-1 py-1.5 text-center font-medium"
                        style={{ ...totalTdStyle(si, total), fontSize: "9px" }}
                      >
                        {total > 0 ? `${total}` : "—"}
                      </td>,
                    ];
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FichePointage;
