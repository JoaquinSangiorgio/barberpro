import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, X, TrendingUp, UserPlus, Trash2, Lock, CheckCircle } from "lucide-react";
import type { Pago } from "../services/payments.api";
import type { Barbero } from "../services/barberos.api";
import { createBarbero, deleteBarbero } from "../services/barberos.api";
import { cerrarCaja, type CierreCaja } from "../services/cierres.api";
import toast from "react-hot-toast";

type Props = {
  pagos: Pago[];
  barberos: Barbero[];
  onClose: () => void;
  onCerrado: () => void;
  onBarberosChange: () => void;
};

const BARBER_COLORS = [
  "from-amber-600/20 to-amber-500/5 border-amber-500/30 text-amber-400",
  "from-blue-600/20 to-blue-500/5 border-blue-500/30 text-blue-400",
  "from-emerald-600/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
  "from-purple-600/20 to-purple-500/5 border-purple-500/30 text-purple-400",
  "from-rose-600/20 to-rose-500/5 border-rose-500/30 text-rose-400",
  "from-cyan-600/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
];

export default function CierreCajaDialog({
  pagos, barberos, onClose, onCerrado, onBarberosChange,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [cierreHecho, setCierreHecho] = useState<CierreCaja | null>(null);
  const [gestionando, setGestionando] = useState(false);
  const [nuevoBarbero, setNuevoBarbero] = useState("");
  const [agregando, setAgregando] = useState(false);

  // Pagos abiertos (no cerrados aún)
  const pagosAbiertos = useMemo(() => pagos.filter((p) => !p.cerrado), [pagos]);

  // Solo aprobados para el resumen económico
  const resumen = useMemo(() => {
    const porBarbero: Record<string, { cortes: number; total: number }> = {};
    for (const p of pagosAbiertos) {
      if (p.status !== "approved") continue;
      const nombre = p.barbero?.trim() || "Sin asignar";
      if (!porBarbero[nombre]) porBarbero[nombre] = { cortes: 0, total: 0 };
      porBarbero[nombre].cortes += 1;
      porBarbero[nombre].total += Number(p.monto);
    }
    return Object.entries(porBarbero).map(([nombre, v]) => ({ nombre, ...v }));
  }, [pagosAbiertos]);

  const totalGeneral = useMemo(
    () => resumen.reduce((s, b) => s + b.total, 0),
    [resumen],
  );

  const totalCortes = useMemo(
    () => resumen.reduce((s, b) => s + b.cortes, 0),
    [resumen],
  );

  const todayLabel = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  async function handleCerrarCaja() {
    setCerrando(true);
    try {
      const cierre = await cerrarCaja(pagosAbiertos);
      setCierreHecho(cierre);
      setConfirmando(false);
      onCerrado();
      toast.success("Caja cerrada correctamente ✅");
    } catch (err: any) {
      toast.error(err.message || "Error cerrando caja ❌");
    } finally {
      setCerrando(false);
    }
  }

  async function handleAgregarBarbero() {
    const nombre = nuevoBarbero.trim();
    if (!nombre) return;
    setAgregando(true);
    try {
      await createBarbero(nombre);
      setNuevoBarbero("");
      onBarberosChange();
      toast.success(`Barbero "${nombre}" agregado ✅`);
    } catch {
      toast.error("Error agregando barbero ❌");
    } finally {
      setAgregando(false);
    }
  }

  async function handleEliminarBarbero(id: string, nombre: string) {
    try {
      await deleteBarbero(id);
      onBarberosChange();
      toast.success(`"${nombre}" eliminado`);
    } catch {
      toast.error("Error eliminando barbero ❌");
    }
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-[#161920] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-800/80 overflow-hidden max-h-[calc(100dvh-76px)] mb-[76px] sm:mb-0 flex flex-col"
      >
        {/* Barra de arrastre mobile */}
        <div className="flex justify-center pt-5 pb-2 sm:hidden">
          <div className="w-10 h-2 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#12141a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <Scissors className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">Cierre de Caja</h2>
              <p className="text-[10px] text-slate-500 capitalize">{todayLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1">

          {/* Estado: caja ya cerrada */}
          {cierreHecho && (
            <div className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-emerald-500/10 p-5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-400">¡Caja cerrada!</p>
                <p className="text-slate-500 text-sm mt-1">a las {cierreHecho.hora}</p>
              </div>
              <div className="bg-[#12141a] rounded-2xl border border-slate-800 p-5 text-left space-y-3">
                {cierreHecho.barberos.map((b) => (
                  <div key={b.nombre} className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-300">{b.nombre}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">{b.cortes} cortes</span>
                      <span className="font-black text-slate-100">${b.total.toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                  <span className="text-lg font-black text-emerald-400">${cierreHecho.total_general.toLocaleString("es-AR")}</span>
                </div>
              </div>
              <button onClick={onClose} className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-sm uppercase tracking-wider hover:bg-slate-700 transition-colors">
                Cerrar
              </button>
            </div>
          )}

          {/* Estado normal */}
          {!cierreHecho && (
            <div className="p-5 space-y-5">

              {/* Sin movimientos */}
              {resumen.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="text-4xl">✂️</div>
                  <p className="text-slate-400 font-bold">Sin movimientos pendientes</p>
                  <p className="text-slate-600 text-[15px]">Los pagos aprobados aparecen aquí hasta el cierre</p>
                </div>
              )}

              {/* Cards por barbero */}
              {resumen.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {resumen.map((b, i) => (
                      <motion.div
                        key={b.nombre}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-gradient-to-br ${BARBER_COLORS[i % BARBER_COLORS.length]} border rounded-2xl p-4 space-y-2`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center text-sm font-black">
                            {b.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider leading-tight">{b.nombre}</span>
                        </div>
                        <div className="text-xl font-black text-slate-100">
                          ${b.total.toLocaleString("es-AR")}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {b.cortes} {b.cortes === 1 ? "corte" : "cortes"}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total general */}
                  <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total general</p>
                        <p className="text-xs text-slate-500">{totalCortes} cortes · {pagosAbiertos.length} registros</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-emerald-400">
                      ${totalGeneral.toLocaleString("es-AR")}
                    </span>
                  </div>
                </>
              )}

              {/* Gestión de barberos */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setGestionando((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#12141a] hover:bg-[#1d222e] transition-colors"
                >
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Gestionar barberos</span>
                  <span className="text-slate-600 text-sm">{gestionando ? "▲" : "▼"}</span>
                </button>

                <AnimatePresence>
                  {gestionando && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        {/* Lista */}
                        {barberos.length === 0 && (
                          <p className="text-xs text-slate-600 italic">No hay barberos registrados</p>
                        )}
                        {barberos.map((b) => (
                          <div key={b.id} className="flex items-center justify-between bg-[#12141a] px-3 py-2 rounded-xl border border-slate-800">
                            <span className="text-sm font-bold text-slate-300">{b.nombre}</span>
                            <button
                              onClick={() => handleEliminarBarbero(b.id, b.nombre)}
                              className="text-rose-400/60 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {/* Agregar */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nuevoBarbero}
                            onChange={(e) => setNuevoBarbero(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAgregarBarbero()}
                            placeholder="Nombre del barbero..."
                            className="flex-1 px-3 py-2 bg-[#0f1115] border border-slate-800 rounded-xl text-slate-200 text-sm placeholder:text-slate-700 focus:border-amber-500 outline-none font-bold"
                          />
                          <button
                            onClick={handleAgregarBarbero}
                            disabled={agregando || !nuevoBarbero.trim()}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl transition-colors"
                          >
                            <UserPlus size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acción */}
        {!cierreHecho && (
          <div className="p-5 border-t border-slate-800 shrink-0">
            {!confirmando ? (
              <button
                onClick={() => setConfirmando(true)}
                disabled={pagosAbiertos.length === 0}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                Cerrar Caja
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-slate-400 font-bold">
                  ¿Confirmar cierre? <span className="text-amber-400">{pagosAbiertos.length} pagos</span> quedarán cerrados
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmando(false)}
                    disabled={cerrando}
                    className="flex-1 py-3 rounded-2xl border border-slate-800 text-slate-400 font-bold text-sm uppercase hover:bg-slate-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCerrarCaja}
                    disabled={cerrando}
                    className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-70"
                  >
                    {cerrando ? "Cerrando..." : "Confirmar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
