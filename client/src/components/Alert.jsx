import { SuccessIcon, ErrorIcon, WarningIcon } from "./icons/SvgIcons";

const Alert = ({ type, message }) => {
  if (!message) return null;

  const styles = {
    success: { bg: "var(--color-success-bg)",  border: "var(--color-success-border)", color: "var(--color-success)" },
    error:   { bg: "var(--color-brand-subtle)", border: "var(--color-brand-muted)",   color: "var(--color-brand)" },
    warning: { bg: "var(--color-warning-bg)",   border: "var(--color-warning-border)", color: "var(--color-warning)" },
    delete:  { bg: "var(--color-danger-bg)",    border: "var(--color-danger-border)",  color: "var(--color-danger)" },
  };

  const iconMap = {
    success: <SuccessIcon width={18} height={18} color={styles[type].color} />,
    error:   <ErrorIcon   width={18} height={18} color={styles[type].color} />,
    warning: <WarningIcon width={18} height={18} color={styles[type].color} />,
    delete:  <ErrorIcon   width={18} height={18} color={styles[type].color} />,
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
