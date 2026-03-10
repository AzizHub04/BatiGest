import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "./icons/SvgIcons";

/**
 * BadgeSelect — themed pill dropdown for status/état fields.
 *
 * Props:
 *   value            - current selected value (string)
 *   onChange         - (newValue: string) => void
 *   options          - Array<{ value: string, bg: string, color: string }>
 *   stopPropagation  - bool, stops click bubbling (needed inside accordion parents)
 */
const BadgeSelect = ({ value, onChange, options, stopPropagation = false }) => {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const close = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      )
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const handleToggle = (e) => {
    if (stopPropagation) e.stopPropagation();
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((p) => !p);
  };

  const handleSelect = (e, val) => {
    if (stopPropagation) e.stopPropagation();
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={triggerRef} className="relative inline-flex">
      {/* ── Trigger pill ── */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none select-none"
        style={{
          backgroundColor: current.bg,
          color: current.color,
          transition: "filter 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.95)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: current.color }}
        />
        {current.value}
        <span
          style={{
            display: "inline-flex",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            opacity: 0.65,
          }}
        >
          <ChevronDownIcon width={10} height={10} color="currentColor" />
        </span>
      </button>

      {/* ── Dropdown panel — portalled to body to escape overflow:hidden ancestors ── */}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              minWidth: 156,
              zIndex: 99999,
              boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
            }}
            className="bg-white rounded-xl border border-gray-100 py-1 overflow-hidden"
            onClick={(e) => stopPropagation && e.stopPropagation()}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleSelect(e, opt.value)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                  style={{
                    backgroundColor: isSelected ? opt.bg : "transparent",
                    transition: "background-color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: isSelected ? opt.color : "#374151" }}
                  >
                    {opt.value}
                  </span>
                  {isSelected && (
                    <span
                      className="ml-auto text-[11px] font-bold"
                      style={{ color: opt.color }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default BadgeSelect;
