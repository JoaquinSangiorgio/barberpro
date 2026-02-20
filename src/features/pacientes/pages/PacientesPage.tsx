"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Paciente, PacienteInput } from "../types";
import type { Paciente as PacienteAPI } from "../services/pacientes.api";
import { listPacientes, createPaciente, updatePaciente, deletePaciente } from "../services/pacientes.api";
import PacienteForm from "../components/PacienteForm";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import CountUp from "react-countup";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";

// Helpers de limpieza
function onlyDigits(s?: string) {
  return (s ?? "").replace(/\D/g, "");
}
function normEmail(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

export default function PacientesPage() {
  const [data, setData] = useState<PacienteAPI[]>([]);
  const [editing, setEditing] = useState<PacienteAPI | null>(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();


  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await listPacientes();
    
      setData([...res]);
    } catch (e: any) {
      toast.error("Error al cargar pacientes");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((p) =>
      [p.nombre, p.apellido, p.dni, p.email, p.telefono]
        .map((v) => (v ?? "").toLowerCase())
        .some((v) => v.includes(s))
    );
  }, [data, q]);

  

  async function handleSubmit(values: PacienteInput) {
    const input: PacienteInput = {
      ...values,
      dni: values.dni ? onlyDigits(values.dni) : undefined,
      email: values.email ? normEmail(values.email) : "",
      telefono: values.telefono ? onlyDigits(values.telefono) : undefined,
    };

    try {
      if (editing) {
        // En Firebase usamos el ID string
        await updatePaciente(String(editing.id), input);
        toast.success("Paciente actualizado ✅");
      } else {
        await createPaciente(input);
        toast.success("Paciente creado ✅");
      }
      setEditing(null);
      setShowModal(false);
      await refresh();
    } catch {
      toast.error("Error al guardar paciente ❌");
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    try {
      await deletePaciente(pendingDeleteId);
      toast.success("Paciente eliminado 🗑️");
      await refresh();
    } catch {
      toast.error("Error eliminando paciente ❌");
    }
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      {/* HEADER ESTILO AGENDA */}
      <header className="w-full md:pl-64 bg-gradient-to-r from-sky-700 to-emerald-600 text-white px-8 py-12 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
              <UsersIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Pacientes</h1>
              <p className="text-emerald-100 font-medium opacity-80">Administración de base de datos médica</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-white/10 px-6 py-2 rounded-2xl border border-white/20 hidden sm:block text-center">
              <div className="text-2xl font-black"><CountUp end={data.length} /></div>
              <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-widest">Registrados</div>
            </div>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
              + NUEVO PACIENTE
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 -mt-8">
        {/* BUSCADOR */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-black text-slate-800">Listado General</h2>
          <div className="relative w-full md:w-96">
            <input
              placeholder="Buscar por nombre, DNI o teléfono..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-600 transition-all"
            />
          </div>
        </div>

        {/* LISTADO RESPONSIVO (MOBILE CARDS / DESKTOP TABLE) */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          {/* Vista Desktop */}
          <table className="hidden sm:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5 font-bold text-slate-700">{p.nombre} {p.apellido}</td>
                  <td className="px-6 py-5 text-sm font-mono text-slate-500">{p.dni}</td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-600">{p.telefono}</div>
                    <div className="text-xs text-slate-400">{p.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-600 hover:text-white transition-all">✏️</button>
                      <button onClick={() => navigate(`/pacientes/${p.id}/historial`)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">📜</button>
                      <button onClick={() => { setPendingDeleteId(String(p.id)); setConfirmOpen(true); }} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Vista Mobile */}
          <div className="sm:hidden p-4 space-y-4">
             {filtered.map((p) => (
               <div key={p.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                 <div>
                   <h3 className="font-black text-slate-800 text-lg">{p.nombre} {p.apellido}</h3>
                   <p className="text-xs font-bold text-slate-400">DNI: {p.dni}</p>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => { setEditing(p); setShowModal(true); }} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600">Editar</button>
                   <button onClick={() => navigate(`/pacientes/${p.id}/historial`)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">Historial</button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* MODALES IGUALES PERO CON ID STRING... */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8">
              <h2 className="text-2xl font-black mb-6 text-slate-800">{editing ? "Editar Ficha" : "Nueva Ficha Médica"}</h2>
              <PacienteForm initial={editing} onSubmit={handleSubmit} onCancel={() => { setEditing(null); setShowModal(false); }} />
            </motion.div>
          </div>
        )}

        {confirmOpen && (
          <ConfirmDialog 
            open={confirmOpen} 
            title="¿Eliminar paciente?" 
            message="Se borrará toda la información del paciente de Firebase de forma permanente."
            onConfirm={confirmDelete} 
            onCancel={() => setConfirmOpen(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Icono decorativo
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}