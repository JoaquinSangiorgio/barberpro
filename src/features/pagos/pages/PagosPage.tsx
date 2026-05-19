"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pago, PacienteLite } from "../services/payments.api";
import {
  listPagos, createPago, updatePago, deletePago, createMPPreference,
} from "../services/payments.api";
import { listPacientes, type Paciente } from "../../pacientes/services/pacientes.api";
import { listBarberos, type Barbero } from "../services/barberos.api";
import PaymentDialog from "../components/PaymentDialog";
import CierreCajaDialog from "../components/CierreCajaDialog";
import HistorialCierresDialog from "../components/HistorialCierresDialog";
import toast, { Toaster } from "react-hot-toast";
import { Activity, DollarSign, Lock, History } from "lucide-react";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";

export default function PagosPage() {
  const [data, setData] = useState<Pago[]>([]);
  const [editing, setEditing] = useState<Pago | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [cierreOpen, setCierreOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [patientsLite, setPatientsLite] = useState<PacienteLite[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [q, setQ] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [filterMode, setFilterMode] = useState<"all" | "today" | "month">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const statusLabels: Record<Pago["status"], string> = {
    approved: "Aprobado",
    pending: "Pendiente",
    rejected: "Rechazado",
  };

  const statusColors: Record<Pago["status"], string> = {
    approved: "bg-[#182520] text-emerald-400 border border-emerald-500/20",
    pending: "bg-[#251f15] text-amber-400 border border-amber-500/20",
    rejected: "bg-[#251517] text-rose-400 border border-rose-500/20",
  };

  async function loadPatients() {
    try {
      const pacientes: Paciente[] = await listPacientes();
      setPatientsLite(
        pacientes.map((p) => ({
          id: String(p.id),
          nombre_completo: `${p.nombre} ${p.apellido}`,
        })),
      );
    } catch {
      toast.error("Error cargando pacientes ❌");
    }
  }

  async function loadBarberos() {
    try {
      setBarberos(await listBarberos());
    } catch {
      // silencioso — el campo queda como texto libre
    }
  }

  async function refresh() {
    try {
      const pagos = await listPagos();
      setData(Array.isArray(pagos) ? pagos : []);
    } catch {
      toast.error("Error cargando pagos ❌");
    }
  }

  useEffect(() => {
    void refresh();
    void loadPatients();
    void loadBarberos();
  }, []);

  async function handleSave(p: any) {
    try {
      const pac = patientsLite.find((pl) => String(pl.id) === String(p.paciente_id));
      const payload = {
        ...p,
        paciente_nombre:
          p.paciente_id === "sin_turno"
            ? "Cliente sin turno"
            : (pac ? pac.nombre_completo : (p.paciente_nombre || "Paciente")),
      };

      if (p.id) {
        await updatePago(payload);
        toast.success("Pago actualizado ✅");
      } else {
        await createPago(payload);
        toast.success("Pago registrado ✅");
      }

      setData([]);
      await refresh();
      setOpen(false);
      setEditing(undefined);
    } catch (err) {
      console.error(err);
      toast.error("Error guardando pago ❌");
    }
  }

  async function askDelete(id: string) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    try {
      await deletePago(pendingDeleteId);
      toast.success("Pago eliminado 🗑️");
      setData([]);
      await refresh();
    } catch {
      toast.error("Error eliminando pago ❌");
    }
    setPendingDeleteId(null);
    setConfirmOpen(false);
  }

  async function handlePayWithMP(p: Omit<Pago, "id">) {
    try {
      const pref = await createMPPreference({
        paciente_id: String(p.paciente_id),
        concepto: p.concepto,
        monto: Number(p.monto),
        cantidad: 1,
      });
      window.location.href = pref.init_point;
    } catch {
      toast.error("Error iniciando pago con Mercado Pago ❌");
    }
  }

  const filtered = useMemo(() => {
    let result = data;

    const s = q.trim().toLowerCase();
    if (s) {
      result = result.filter((p) =>
        [p.paciente_nombre, p.metodo, p.concepto, p.fecha, p.monto, p.barbero, statusLabels[p.status]]
          .map((v) => String(v ?? "").toLowerCase())
          .some((v) => v.includes(s)),
      );
    }

    if (filterMode === "today") {
      result = result.filter((p) => p.fecha?.slice(0, 10) === todayStr && p.status === "approved");
    } else if (filterMode === "month") {
      result = result.filter((p) => p.fecha?.slice(0, 7) === selectedMonth);
    }

    return result;
  }, [data, q, filterMode, selectedMonth, todayStr]);

  const totalAprobado = useMemo(
    () => filtered.filter((p) => p.status === "approved").reduce((sum, p) => sum + Number(p.monto), 0),
    [filtered],
  );

  // Conteo de pagos abiertos (sin cerrar) para badge en el botón de cierre
  const pagosAbiertos = useMemo(() => data.filter((p) => !p.cerrado), [data]);

  return (
    <div className="min-h-screen bg-[#0f1115] font-sans text-slate-100 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { backgroundColor: "#161920", color: "#f1f5f9", border: "1px solid #334155" },
        }}
      />

      {/* HEADER */}
      <header className="w-full md:pl-64 bg-[#161920] text-white px-6 py-10 shadow-xl border-b border-slate-800/40 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-5">
            <div className="bg-amber-600/10 p-4 rounded-2xl border border-amber-500/20">
              <Activity className="w-9 h-9 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-amber-500 uppercase">Finanzas</h1>
              <p className="text-slate-400 font-medium text-sm">Gestión de ingresos</p>
            </div>
          </motion.div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Row 1: search + botones */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Buscar cliente, barbero o concepto..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="px-5 py-3 rounded-2xl bg-[#12141a] border border-slate-800 text-slate-200 placeholder:text-slate-700 focus:border-amber-500 outline-none w-full sm:w-64 transition-all font-bold text-sm"
              />
              <button
                onClick={() => { setEditing(undefined); setOpen(true); }}
                className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-950/40 transition-all active:scale-95 text-sm uppercase tracking-wider border border-amber-500/15"
              >
                + Registrar Pago
              </button>
              {/* Botón Cierre de Caja con badge */}
              <button
                onClick={() => setCierreOpen(true)}
                className="relative bg-[#12141a] hover:bg-[#1d222e] border border-emerald-800/40 hover:border-emerald-600/60 text-emerald-400 px-5 py-3 rounded-2xl font-black transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center gap-2"
              >
                <Lock size={15} />
                Cierre de Caja
                {pagosAbiertos.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {pagosAbiertos.length > 99 ? "99+" : pagosAbiertos.length}
                  </span>
                )}
              </button>
              {/* Botón Historial de cierres */}
              <button
                onClick={() => setHistorialOpen(true)}
                className="bg-[#12141a] hover:bg-[#1d222e] border border-slate-800 hover:border-amber-500/40 text-amber-400 px-5 py-3 rounded-2xl font-black transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center gap-2"
              >
                <History size={15} />
                Historial
              </button>
            </div>

            {/* Row 2: filtros */}
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "today", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                    filterMode === mode
                      ? "bg-amber-600 text-white border-amber-500"
                      : "bg-[#12141a] text-slate-400 border-slate-800 hover:border-amber-500/40 hover:text-slate-200"
                  }`}
                >
                  {mode === "all" ? "Todos" : mode === "today" ? "Hoy" : "Por mes"}
                </button>
              ))}
              {filterMode === "month" && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-[#12141a] border border-slate-800 text-slate-200 focus:border-amber-500 outline-none text-xs font-bold transition-all"
                />
              )}
              {filterMode !== "all" && (
                <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-500/20 px-4 py-2 rounded-xl">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Aprobado:</span>
                  <span className="text-sm font-black text-emerald-400">
                    ${totalAprobado.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full md:pl-64 p-6 mt-6 bg-[#0f1115]">
        <div className="max-w-7xl mx-auto">

          {/* TABLA DESKTOP */}
          <div className="hidden md:block overflow-hidden bg-[#161920] rounded-[2.5rem] shadow-2xl border border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12141a] border-b border-slate-800">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Barbero</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Método</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-[#1d222e]/30 transition-colors group ${p.cerrado ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      {p.barbero ? (
                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          {p.barbero}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200 text-sm">{p.paciente_nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">{p.fecha}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 italic">{p.concepto}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-100">${Number(p.monto).toLocaleString("es-AR")}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-slate-300 bg-[#12141a] px-3 py-1 rounded-lg border border-slate-800">
                        {p.metodo || "Efectivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${statusColors[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setEditing(p); setOpen(true); }} className="p-2 text-amber-500 hover:bg-[#12141a] border border-transparent hover:border-slate-800 rounded-xl transition-colors text-xs font-bold">Editar</button>
                        <button onClick={() => askDelete(p.id)} className="p-2 text-rose-400 hover:bg-[#12141a] border border-transparent hover:border-slate-800 rounded-xl transition-colors text-xs font-bold">Borrar</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && !q && (
              <div className="p-20 text-center text-slate-500 font-medium italic">No se encontraron pagos registrados.</div>
            )}
            {filtered.length === 0 && q && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center space-y-4">
                <div className="text-5xl">🔎</div>
                <p className="text-slate-400 font-bold text-lg">
                  Nada con "<span className="text-amber-500">{q}</span>"
                </p>
                <button onClick={() => setQ("")} className="text-amber-500 font-black text-xs uppercase tracking-widest hover:underline">
                  Limpiar búsqueda
                </button>
              </motion.div>
            )}
          </div>

          {/* CARDS MOBILE */}
          <div className="md:hidden space-y-4">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                className={`bg-[#161920] p-5 rounded-3xl shadow-md border border-slate-800/80 space-y-3 ${p.cerrado ? "opacity-50" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {p.barbero && (
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase tracking-wider">
                          {p.barbero}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-slate-200 text-base">{p.paciente_nombre}</h3>
                    <p className="text-xs font-bold text-slate-500">{p.fecha} · <span className="text-amber-400">{p.metodo || "Efectivo"}</span></p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </div>
                {p.concepto && (
                  <p className="text-sm text-slate-400 italic bg-[#12141a] px-3 py-2 rounded-xl border border-slate-800/40">"{p.concepto}"</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-slate-100">${Number(p.monto).toLocaleString("es-AR")}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(p); setOpen(true); }} className="bg-[#12141a] border border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-300">Editar</button>
                    <button onClick={() => askDelete(p.id)} className="bg-rose-950/20 border border-rose-900/20 px-3 py-2 rounded-xl text-xs font-bold text-rose-400">Borrar</button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-500 italic">Sin registros</div>
            )}
          </div>

        </div>
      </main>

      {/* DIALOG: Nuevo/Editar pago */}
      <AnimatePresence>
        {open && (
          <PaymentDialog
            initial={editing}
            pacientes={patientsLite}
            barberos={barberos}
            onSave={handleSave}
            onDelete={editing ? (id) => askDelete(String(id)) : undefined}
            onCancel={() => { setOpen(false); setEditing(undefined); }}
            onPayWithMP={handlePayWithMP}
          />
        )}
      </AnimatePresence>

      {/* DIALOG: Historial de cierres */}
      <AnimatePresence>
        {historialOpen && (
          <HistorialCierresDialog onClose={() => setHistorialOpen(false)} />
        )}
      </AnimatePresence>

      {/* DIALOG: Cierre de caja */}
      <AnimatePresence>
        {cierreOpen && (
          <CierreCajaDialog
            pagos={data}
            barberos={barberos}
            onClose={() => setCierreOpen(false)}
            onCerrado={async () => { await refresh(); }}
            onBarberosChange={loadBarberos}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar registro?"
        message="Esta acción borrará el cobro de la base de datos de forma permanente."
        confirmText="Eliminar Cobro"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
