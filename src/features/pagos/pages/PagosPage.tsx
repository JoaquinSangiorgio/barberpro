"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pago, PacienteLite } from "../services/payments.api";
import {
  listPagos,
  createPago,
  updatePago,
  deletePago,
  createMPPreference,
} from "../services/payments.api";
import { listPacientes, type Paciente } from "../../pacientes/services/pacientes.api";
import PaymentDialog from "../components/PaymentDialog";
import CountUp from "react-countup";
import toast, { Toaster } from "react-hot-toast";
import { Activity, DollarSign } from "lucide-react";
import ConfirmDialog from "../../../shared/components/ConfirmDialog"; 

export default function PagosPage() {
  const [data, setData] = useState<Pago[]>([]);
  const [editing, setEditing] = useState<Pago | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [patientsLite, setPatientsLite] = useState<PacienteLite[]>([]);
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

  // Ajuste fino de colores de estado para un modo oscuro balanceado
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
        }))
      );
    } catch {
      toast.error("Error cargando pacientes ❌");
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
  }, []);

  async function handleSave(p: any) {
    try {
      const pac = patientsLite.find(pl => String(pl.id) === String(p.paciente_id));
      const payload = {
        ...p,
        paciente_nombre: pac ? pac.nombre_completo : (p.paciente_nombre || "Paciente"),
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
      toast.error("Error Comicando pago ❌");
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
        [p.paciente_nombre, p.metodo, p.concepto, p.fecha, p.monto, statusLabels[p.status]]
          .map((v) => String(v ?? "").toLowerCase())
          .some((v) => v.includes(s))
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
    [filtered]
  );

  return (
    <div className="min-h-screen bg-[#0f1115] font-sans text-slate-100 flex flex-col">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { backgroundColor: '#161920', color: '#f1f5f9', border: '1px solid #334155' }
        }} 
      />

      {/* HEADER */}
      <header className="w-full md:pl-64 bg-[#161920] text-white px-6 py-12 shadow-xl border-b border-slate-800/40 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-5">
            <div className="bg-amber-600/10 p-4 rounded-2xl border border-amber-500/20 text-amber-500">
              <Activity className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-amber-500 uppercase">Finanzas</h1>
              <p className="text-slate-400 font-medium opacity-90">Gestión de ingresos</p>
            </div>
          </motion.div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            {/* Row 1: search + register + counter */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                placeholder="Buscar paciente o concepto..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="px-5 py-3 rounded-2xl bg-[#12141a] border border-slate-800 text-slate-200 placeholder:text-slate-700 focus:border-amber-500 outline-none w-full sm:w-72 transition-all font-bold text-sm"
              />
              <button
                onClick={() => { setEditing(undefined); setOpen(true); }}
                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-amber-950/40 transition-all active:scale-95 w-full sm:w-auto text-sm uppercase tracking-wider border border-amber-500/15"
              >
                + REGISTRAR PAGO
              </button>
              <div className="bg-[#1d222e] px-6 py-2 rounded-2xl border border-slate-800 hidden lg:block text-center shadow-inner">
                <div className="text-2xl font-black text-amber-400"><CountUp end={data.length} /></div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Registros</div>
              </div>
            </div>

            {/* Row 2: filter buttons */}
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
                  {mode === "all" ? "Todos" : mode === "today" ? "Hoy (aprobados)" : "Por mes"}
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
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Total aprobado:</span>
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
          
          <div className="hidden md:block overflow-hidden bg-[#161920] rounded-[2.5rem] shadow-2xl border border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12141a] border-b border-slate-800">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                  {/* 💳 Nueva Columna: Método */}
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Método</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map((p) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-[#1d222e]/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-200">{p.paciente_nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">{p.fecha}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 italic">{p.concepto}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-100">${Number(p.monto).toLocaleString("es-AR")}</td>
                    {/* Celda del Método */}
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
            {filtered.length === 0 && (
              <div className="p-20 text-center text-slate-500 font-medium italic">No se encontraron pagos registrados.</div>
            )}

            {data.length > 0 && filtered.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="p-20 text-center space-y-4"
              >
                <div className="text-5xl">🔎</div>
                <p className="text-slate-400 font-bold text-lg">
                  No se encontró nada que coincida con "<span className="text-amber-500">{q}</span>"
                </p>
                <button 
                  onClick={() => setQ("")}
                  className="text-amber-500 font-black text-xs uppercase tracking-widest hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </motion.div>
            )}
          </div>

          {/* MOBILE CARDS - También actualizado con el método */}
          <div className="md:hidden space-y-4">
            {filtered.map((p) => (
              <motion.div key={p.id} className="bg-[#161920] p-6 rounded-3xl shadow-md border border-slate-800/80 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-200 text-lg">{p.paciente_nombre}</h3>
                    <p className="text-xs font-bold text-slate-500">{p.fecha} · <span className="text-amber-400">{p.metodo || "Efectivo"}</span></p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-400 italic bg-[#12141a] p-3 rounded-2xl border border-slate-800/40">"{p.concepto}"</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-slate-100">${Number(p.monto).toLocaleString("es-AR")}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(p); setOpen(true); }} className="bg-[#12141a] border border-slate-800 p-2 rounded-xl text-xs font-bold text-slate-300">Editar</button>
                    <button onClick={() => askDelete(p.id)} className="bg-rose-950/20 border border-rose-900/20 p-2 rounded-xl text-xs font-bold text-rose-400">Borrar</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>

      <AnimatePresence>
        {open && (
          <PaymentDialog
            initial={editing}
            pacientes={patientsLite}
            onSave={handleSave}
            onDelete={editing ? (id) => askDelete(String(id)) : undefined}
            onCancel={() => { setOpen(false); setEditing(undefined); }}
            onPayWithMP={handlePayWithMP}
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