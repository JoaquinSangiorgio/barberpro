import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Variant = "success" | "error" | "info";
type Toast = { id: string; title?: string; message: string; variant?: Variant; duration?: number };

type Ctx = {
  toast: (t: Omit<Toast, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);
export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => setItems((xs) => xs.filter((t) => t.id !== id)), []);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const item: Toast = { id, duration: 3500, variant: "info", ...t };
    setItems((xs) => [...xs, item]);
    if (item.duration! > 0) setTimeout(() => remove(id), item.duration);
  }, [remove]);

  const api = useMemo<Ctx>(() => ({
    toast,
    success: (m, title) => toast({ message: m, title, variant: "success" }),
    error:   (m, title) => toast({ message: m, title, variant: "error" }),
    info:    (m, title) => toast({ message: m, title, variant: "info" }),
  }), [toast]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-end gap-2 p-4 sm:p-6">
          {items.map((t) => (
            <div
              key={t.id}
              className={[
                "pointer-events-auto w-full max-w-sm rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur-md transition",
                t.variant === "success" && "border-emerald-200",
                t.variant === "error"   && "border-rose-200",
                t.variant === "info"    && "border-sky-200",
              ].filter(Boolean).join(" ")}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">
                  {t.variant === "success" ? "✅" : t.variant === "error" ? "⚠️" : "ℹ️"}
                </span>
                <div className="flex-1">
                  {t.title && <div className="text-sm font-semibold">{t.title}</div>}
                  <div className="text-sm text-slate-700">{t.message}</div>
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-md px-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}
