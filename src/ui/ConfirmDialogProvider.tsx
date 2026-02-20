import React, { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";

type Options = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
};

type Ctx = {
  confirm: (opts: Options) => Promise<boolean>;
};

const ConfirmCtx = createContext<Ctx | null>(null);
export function useConfirm(): Ctx {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmDialogProvider>");
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(Options & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((opts: Options) => {
    return new Promise<boolean>((resolve) => setState({ ...opts, resolve }));
  }, []);

  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={{ confirm }}>
      {children}
      {state && createPortal(
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => close(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
              <div className="mb-3 text-lg font-semibold">{state.title ?? "Confirmar acción"}</div>
              {state.message && <div className="mb-4 text-sm text-slate-600">{state.message}</div>}
              <div className="flex justify-end gap-2">
                <button className="btn-ghost" onClick={() => close(false)}>
                  {state.cancelText ?? "Cancelar"}
                </button>
                <button
                  className={`btn-primary ${state.tone === "danger" ? "bg-rose-600 hover:bg-rose-700" : ""}`}
                  onClick={() => close(true)}
                >
                  {state.confirmText ?? "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmCtx.Provider>
  );
}
