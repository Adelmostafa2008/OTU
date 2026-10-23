import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [visible, setVisible] = useState(false);
  const [entry, setEntry] = useState({ message: "", severity: "info" });
  const [dontAutoClose, setDontAutoClose] = useState(false);

  const COLORS = {
    success: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
      icon: "text-green-500",
      swallowMs: 4500,
    },
    error: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "text-red-500",
      swallowMs: 5500,
    },
    warning: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: "text-yellow-500",
      swallowMs: 5000,
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: "text-blue-500",
      swallowMs: 4000,
    },
  };

  const swallowNext = useCallback((ms = 350) => {
    setDontAutoClose(true);
    setTimeout(() => setDontAutoClose(false), ms);
  }, []);

  const show = useCallback(
    (message, severity = "info", opts = {}) => {
      if (!message) return;
      const next = {
        message,
        severity,
        duration: opts.duration ?? COLORS[severity]?.swallowMs ?? 4000,
        action:
          typeof opts.action === "function" ? opts.action : null,
        id: typeof opts.id === "number" ? opts.id : Date.now() + Math.random(),
        noAutoClose: !!opts.noAutoClose,
      };
      setQueue((prev) => [...prev, next]);
    },
    []
  );

  const dismiss = useCallback(() => {
    const head = queue[0];
    if (head?.dontAutoClose) setDontAutoClose(false);
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      return prev.length === 1 ? [] : prev.slice(1);
    });
    if (queue.length === 1) {
      setVisible(false);
      setEntry({ message: "", severity: "info" });
    }
  }, [queue]);

  useEffect(() => {
    setQueue([]);
    setVisible(false);
    setEntry({ message: "", severity: "info" });
  }, []);

  useEffect(() => {
    if (queue.length === 0) {
      setVisible(false);
      setEntry({ message: "", severity: "info" });
      return;
    }
    const next = queue[0];
    setEntry(next);
    setVisible(true);
    if (!next.noAutoClose) {
      const t = setTimeout(() => {
        setQueue((prev) => (prev.length === 1 ? [] : prev.slice(1)));
      }, next.duration);
      return () => clearTimeout(t);
    }
  }, [queue]);

  return (
    <SnackbarContext.Provider
      value={{
        show,
        dismiss,
        swallowNext,
        colors: COLORS,
        queue,
        visible,
        entry,
      }}
    >
      {children}
      <SnackbarView />
    </SnackbarContext.Provider>
  );
};

const SnackbarView = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx || !ctx.visible) return null;
  const { message, severity, action } = ctx.entry;
  const color = ctx.colors[severity] ?? ctx.colors.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]"
    >
      <div
        className={`
          absolute bottom-7 left-1/2 -translate-x-1/2 max-w-md w-full
          ${color.bg}
          border ${color.border}
          rounded-xl px-4.5 py-[11px] shadow-[0_10px_30px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)]
          flex items-center gap-3 pointer-events-auto
          animate-[snackbar-in_0.28s_cubic-bezier(0.22,1,0.36,1)]
          transition-opacity transition-transform
        `}
      >
        <span className="text-base font-semibold">{message}</span>
        {action ? (
          <button
            className={`rounded-lg border ${color.border} ${color.text} px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer`}
            onClick={(e) => {
              e.stopPropagation();
              action();
              ctx.dismiss();
            }}
          >
            {action.label ?? "Ok"}
          </button>
        ) : (
          <button
            className="bg-transparent border-0 text-current cursor-pointer text-2xl leading-none px-1 py-0.5 opacity-90 transition-opacity hover:opacity-100"
            onClick={() => ctx.dismiss()}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return ctx;
};
