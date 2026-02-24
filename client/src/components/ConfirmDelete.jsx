const ConfirmDelete = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#dc55391a" }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="#dc5539"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
            style={{ transition: "background-color 0.15s" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium"
            style={{
              backgroundColor: "#dc5539",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#c44a30")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc5539")}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
