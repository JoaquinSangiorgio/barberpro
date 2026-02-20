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
import { Activity, DollarSign } from "lucide-react"; // Agregamos DollarSign para un toque extra
import ConfirmDialog from "../../../shared/components/ConfirmDialog"; 

export default function PagosPage() {
  const [data, setData] = useState<Pago[]>([]);
  const [editing, setEditing] = useState<Pago | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [patientsLite, setPatientsLite] = useState<PacienteLite[]>([]);
  const [q, setQ] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const statusLabels: Record<Pago["status"], string> = {
    approved: "Aprobado",
    pending: "Pendiente",
    rejected: "Rechazado",
  };

  const statusColors: Record<Pago["status"], string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
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
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((p) =>
      [p.paciente_nombre, p.metodo, p.concepto, p.fecha ,p.monto, statusLabels[p.status]]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(s))
    );
  }, [data, q]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="w-full md:pl-64 bg-gradient-to-r from-sky-700 to-emerald-600 text-white px-6 py-12 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-5">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Finanzas</h1>
              <p className="text-emerald-100 font-medium opacity-90">Gestión de ingresos y Mercado Pago</p>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Buscar paciente o concepto..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:ring-2 focus:ring-emerald-400 outline-none w-full sm:w-72 transition-all"
            />
            <button
              onClick={() => { setEditing(undefined); setOpen(true); }}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-900/20 transition-all active:scale-95 w-full sm:w-auto"
            >
              + REGISTRAR PAGO
            </button>
            <div className="bg-white/10 px-6 py-2 rounded-2xl border border-white/20 hidden lg:block text-center">
              <div className="text-2xl font-black"><CountUp end={data.length} /></div>
              <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-widest">Registros</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 -mt-10">
        <div className="hidden md:block overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
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
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-700">{p.paciente_nombre}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{p.fecha}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 italic">{p.concepto}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-800">${Number(p.monto).toLocaleString("es-AR")}</td>
                  {/* Celda del Método */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
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
                      <button onClick={() => { setEditing(p); setOpen(true); }} className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors text-xs font-bold">Editar</button>
                      <button onClick={() => askDelete(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold">Borrar</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium italic">No se encontraron pagos registrados.</div>
          )}

          {data.length > 0 && filtered.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="p-20 text-center space-y-4"
            >
              <div className="text-5xl">🔎</div>
              <p className="text-slate-500 font-bold text-lg">
                No se encontró nada que coincida con "<span className="text-sky-600">{q}</span>"
              </p>
              <button 
                onClick={() => setQ("")}
                className="text-sky-500 font-black text-xs uppercase tracking-widest hover:underline"
              >
                Limpiar búsqueda
              </button>
            </motion.div>
          )}
        </div>

        {/* MOBILE CARDS - También actualizado con el método */}
        <div className="md:hidden space-y-4">
          {filtered.map((p) => (
            <motion.div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{p.paciente_nombre}</h3>
                  <p className="text-xs font-bold text-slate-400">{p.fecha} · <span className="text-sky-600">{p.metodo || "Efectivo"}</span></p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${statusColors[p.status]}`}>
                  {statusLabels[p.status]}
                </span>
              </div>
              <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-2xl">"{p.concepto}"</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-black text-slate-800">${Number(p.monto).toLocaleString("es-AR")}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(p); setOpen(true); }} className="bg-slate-100 p-2 rounded-xl text-xs font-bold text-slate-600">Editar</button>
                  <button onClick={() => askDelete(p.id)} className="bg-rose-50 p-2 rounded-xl text-xs font-bold text-rose-600">Borrar</button>
                </div>
              </div>
            </motion.div>
          ))}
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