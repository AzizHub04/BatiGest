import { SuccessIcon, ErrorIcon, WarningIcon } from "./icons/SvgIcons";

const Alert = ({ type, message }) => {
  if (!message) return null;

  const styles = {
    success: { bg: "#dcfce7", border: "#bbf7d0", color: "#16a34a" },
    error: { bg: "#dc55391a", border: "#dc55394d", color: "#dc5539" },
    warning: { bg: "#fef3c7", border: "#fde68a", color: "#d97706" },
    delete: { bg: "#fee2e2", border: "#fecaca", color: "#dc2626" },
  };

  const iconMap = {
    success: <SuccessIcon width={18} height={18} color={styles[type].color} />,
    error: <ErrorIcon width={18} height={18} color={styles[type].color} />,
    warning: <WarningIcon width={18} height={18} color={styles[type].color} />,
    delete: <ErrorIcon width={18} height={18} color={styles[type].color} />,
  };

  const s = styles[type];

  return (
    <div
      className="mb-4 p-3.5 rounded-xl flex items-center gap-2.5"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
    >
      {iconMap[type]}
      <p className="text-sm font-medium" style={{ color: s.color }}>
        {message}
      </p>
    </div>
  );
};

export default Alert;
