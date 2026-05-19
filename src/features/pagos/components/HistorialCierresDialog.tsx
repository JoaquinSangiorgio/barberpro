import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, History, TrendingUp } from "lucide-react";
import { listCierres, type CierreCaja } from "../services/cierres.api";

type Props = {
  onClose: () => void;
};

const BARBER_COLORS = [
  "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "text-rose-400 bg-rose-500/10 border-rose-500/20",
  "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
];

function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function HistorialCierresDialog({ onClose }: Props) {
  const [cierres, setCierres] = useState<CierreCaja[]>([]);
  const [loading, setLoading] = useState(true);

  //bloqueo de scroll de pagina al abrir dialog
useEffect(() => {
  const originalStyle = window.getComputedStyle(document.body).overflow;
  
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalStyle;
  };
}, []);

  useEffect(() => {
    listCierres()
      .then(setCierres)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-[#161920] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-800/80 overflow-hidden max-h-[92dvh] flex flex-col"
      >
        {/* Drag bar mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#12141a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <History className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">Historial de Cierres</h2>
              {!loading && (
                <p className="text-[15px] text-slate-500">
                  {cierres.length === 0 ? "Sin registros" : `${cierres.length} ${cierres.length === 1 ? "cierre" : "cierres"}`}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {loading && (
            <div className="py-16 text-center text-slate-500 text-sm animate-pulse">
              Cargando historial...
            </div>
          )}

          {!loading && cierres.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="text-4xl">📋</div>
              <p className="text-slate-400 font-bold">Sin cierres registrados</p>
              <p className="text-slate-600 text-xs">Los cierres de caja aparecerán aquí</p>
            </div>
          )}

          {!loading && cierres.map((c) => (
            <div key={c.id} className="bg-[#12141a] rounded-2xl border border-slate-800 overflow-hidden">
              {/* Date + total */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/60">
                <div>
                  <p className="text-md font-black text-slate-300 capitalize">{formatFecha(c.fecha)}</p>
                  <p className="text-[15px] text-slate-200 mt-0.5">
                    {c.hora} · {c.pagos_cerrados} {c.pagos_cerrados === 1 ? "pago" : "pagos"} cerrados
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-base font-black text-emerald-400">
                    ${c.total_general.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Barbers */}
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {c.barberos.length === 0 ? (
                  <span className="text-xs text-slate-600 italic">Sin detalle por barbero</span>
                ) : (
                  c.barberos.map((b, i) => (
                    <div
                      key={b.nombre}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold ${BARBER_COLORS[i % BARBER_COLORS.length]}`}
                    >
                      <span className="font-black">{b.nombre}</span>
                      <span className="opacity-40">·</span>
                      <span>{b.cortes} {b.cortes === 1 ? "corte" : "cortes"}</span>
                      <span className="opacity-40">·</span>
                      <span>${b.total.toLocaleString("es-AR")}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-sm uppercase tracking-wider hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
