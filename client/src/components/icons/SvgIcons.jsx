// SVG Icons Component Library

export const LoadingSpinner = ({ size = 8, color = "#dc5539" }) => (
  <svg
    className={`animate-spin h-${size} w-${size}`}
    fill="none"
    viewBox="0 0 24 24"
    style={{ color }}
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
);

export const HouseIcon = ({ width = 48, height = 48, color = "#9ca3af" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const LocationIcon = ({
  width = 16,
  height = 16,
  color = "#9ca3af",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ChartIcon = ({ width = 24, height = 24, color = "#dc5539" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const CalendarIcon = ({
  width = 24,
  height = 24,
  color = "#2563eb",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const ClockIcon = ({ width = 14, height = 14, color = "#9ca3af" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const BoxIcon = ({ width = 16, height = 16, color = "#dc5539" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export const PeopleIcon = ({ width = 16, height = 16, color = "#16a34a" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const EyeIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const CheckIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const XIcon = ({ width = 20, height = 20, color = "currentColor" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const TrashIcon = ({ width = 24, height = 24, color = "#dc2626" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const PhoneIcon = ({
  width = 20,
  height = 20,
  color = "white",
  strokeW = 1.5,
}) => (
  <svg width={width} height={height} fill="none" viewBox="0 0 24 24">
    <rect
      x="3"
      y="2"
      width="18"
      height="20"
      rx="2"
      stroke={color}
      strokeWidth={strokeW}
    />
    <rect
      x="7"
      y="5"
      width="3"
      height="3"
      rx="0.5"
      fill={`rgba(${color === "white" ? "255,255,255" : "0,0,0"},0.7)`}
    />
    <rect
      x="14"
      y="5"
      width="3"
      height="3"
      rx="0.5"
      fill={`rgba(${color === "white" ? "255,255,255" : "0,0,0"},0.7)`}
    />
    <rect
      x="7"
      y="10"
      width="3"
      height="3"
      rx="0.5"
      fill={`rgba(${color === "white" ? "255,255,255" : "0,0,0"},0.7)`}
    />
    <rect
      x="14"
      y="10"
      width="3"
      height="3"
      rx="0.5"
      fill={`rgba(${color === "white" ? "255,255,255" : "0,0,0"},0.7)`}
    />
    <path
      d="M9 22v-5h6v5"
      stroke={color}
      strokeWidth={strokeW}
      strokeLinecap="round"
    />
  </svg>
);

export const CloseIcon = ({ width = 18, height = 18, color = "#dc5539" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const MailIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const LockIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Decorative Background Icons
export const BrickIcon = () => (
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

export const HammerIcon = () => (
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

export const CraneIcon = () => (
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

export const HelmetIcon = () => (
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

export const WrenchIcon = () => (
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

export const CementIcon = () => (
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

export const RuleIcon = () => (
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

export const GearIcon = () => (
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

export const SawIcon = () => (
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

export const TruckIcon = () => (
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

export const WallIcon = () => (
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

export const PipeIcon = () => (
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

export const PaintIcon = () => (
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

export const BeamIcon = () => (
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

export const LadderIcon = () => (
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

export const BoltIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" opacity="0.2">
    <path
      d="M22 4L12 22h8l-4 14L30 18h-8l4-14z"
      stroke="white"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

// Alert Icons
export const SuccessIcon = ({ width = 18, height = 18, color = "#16a34a" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const ErrorIcon = ({ width = 18, height = 18, color = "#dc5539" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const WarningIcon = ({ width = 18, height = 18, color = "#d97706" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Functional Icons
export const PlusIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const EditIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const GridIcon = ({ width = 18, height = 18, color = "#dc5539" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M3 9h18" />
  </svg>
);

export const ChevronRightIcon = ({
  width = 16,
  height = 16,
  color = "#9ca3af",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const DocumentIcon = ({
  width = 18,
  height = 18,
  color = "#dc5539",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const ArrowUpIcon = ({ width = 12, height = 12, color = "#16a34a" }) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17 17L7 7M7 17V7h10" />
  </svg>
);

export const ArrowDownIcon = ({
  width = 12,
  height = 12,
  color = "#dc2626",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M7 7l10 10M17 7v10H7" />
  </svg>
);

// Additional UI Icons
export const BellIcon = ({
  width = 24,
  height = 24,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const SearchIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const FilterIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const DownloadIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const MenuIcon = ({
  width = 24,
  height = 24,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const ChevronDownIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const DotIcon = ({ width = 4, height = 4, color = "currentColor" }) => (
  <svg width={width} height={height} fill={color} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const MoreIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg width={width} height={height} fill={color} viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

export const ChevronLeftIcon = ({
  width = 18,
  height = 18,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const DashboardIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const BuildingIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 21V9h6v12" />
    <path d="M3 9h18" />
  </svg>
);

export const UserPlusIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M4 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M17.5 7.5h4M19.5 5.5v4" />
  </svg>
);

export const PackageIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);

export const CheckSquareIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export const NoteIcon = ({
  width = 20,
  height = 20,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const SwapIcon = ({
  width = 16,
  height = 16,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

export const CurrencyIcon = ({
  width = 16,
  height = 16,
  color = "currentColor",
}) => (
  <svg
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
