"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-status-approved-fg/20 bg-status-approved-bg text-status-approved-fg",
  error: "border-status-rejected-fg/20 bg-status-rejected-bg text-status-rejected-fg",
  info: "border-accent/20 bg-accent-tint text-accent",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "i",
};

const DISMISS_AFTER_MS = 4_500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, variant, message }]);
      setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: useCallback((message: string) => show("success", message), [show]),
    error: useCallback((message: string) => show("error", message), [show]),
    info: useCallback((message: string) => show("info", message), [show]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4.5 right-4.5 z-100 flex w-85 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`animate-mz-in pointer-events-auto flex items-start gap-2.5 rounded-[10px] border px-3.5 py-2.75 text-[12.5px] leading-relaxed shadow-float ${VARIANT_STYLES[toast.variant]}`}
          >
            <span className="mt-px flex-none text-[12px] font-bold">{VARIANT_ICON[toast.variant]}</span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="flex-none text-[11px] opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
