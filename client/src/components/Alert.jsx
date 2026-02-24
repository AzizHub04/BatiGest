const Alert = ({ type, message }) => {
  if (!message) return null;

  const styles = {
    success: { bg: "#dcfce7", border: "#bbf7d0", color: "#16a34a" },
    error: { bg: "#dc55391a", border: "#dc55394d", color: "#dc5539" },
    warning: { bg: "#fef3c7", border: "#fde68a", color: "#d97706" },
    delete: { bg: "#fee2e2", border: "#fecaca", color: "#dc2626" },
  };

  const icons = {
    success: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    error: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </>
    ),
    warning: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
    delete: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };

  const s = styles[type];

  return (
    <div
      className="mb-4 p-3.5 rounded-xl flex items-center gap-2.5"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
    >
      <svg
        width="18"
        height="18"
        fill="none"
        stroke={s.color}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        {icons[type]}
      </svg>
      <p className="text-sm font-medium" style={{ color: s.color }}>
        {message}
      </p>
    </div>
  );
};

export default Alert;
