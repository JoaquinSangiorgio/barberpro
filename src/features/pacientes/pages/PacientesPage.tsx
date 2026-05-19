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
import { X } from "lucide-react";

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
      toast.error("Error al cargar clientes");
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
        await updatePaciente(String(editing.id), input);
        toast.success("Cliente actualizado ✅");
      } else {
        await createPaciente(input);
        toast.success("Cliente creado ✅");
      }
      setEditing(null);
      setShowModal(false);
      await refresh();
    } catch {
      toast.error("Error al guardar cliente ❌");
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    try {
      await deletePaciente(pendingDeleteId);
      toast.success("Cliente eliminado 🗑️");
      await refresh();
    } catch {
      toast.error("Error eliminando cliente ❌");
    }
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0f1115]">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { backgroundColor: '#161920', color: '#f1f5f9', border: '1px solid #334155' }
        }} 
      />

      {/* HEADER ESTILO AGENDA (COLORES CAMBIADOS A BARBER SHOP) */}
      <header className="w-full md:pl-64 bg-[#161920] border-b border-amber-900/15 text-slate-100 px-8 py-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-red-600 via-white to-blue-600 opacity-50" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="bg-amber-600/10 border border-amber-500/20 p-4 rounded-2xl text-amber-500 shadow-inner">
              <UsersIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-amber-500 uppercase">Clientes</h1>
              <p className="text-slate-400 font-medium opacity-80">Administración de base de datos </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-[#1d222e] px-6 py-2 rounded-2xl border border-slate-800 hidden sm:block text-center shadow-inner">
              <div className="text-2xl font-black text-amber-400"><CountUp end={data.length} /></div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Registrados</div>
            </div>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-amber-950/40 border border-amber-500/20 transition-all active:scale-95"
            >
              + NUEVO CLIENTE
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 -mt-8 relative z-10">
        {/* BUSCADOR */}
        <div className="bg-[#161920] p-6 rounded-[2rem] shadow-xl border border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-black text-slate-200 uppercase tracking-wider">Listado General</h2>
          <div className="relative w-full md:w-96">
            <input
              placeholder="Buscar por nombre, DNI o teléfono..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full px-6 py-3 bg-[#12141a] border-2 border-slate-800 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-200 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* LISTADO RESPONSIVO (MOBILE CARDS / DESKTOP TABLE) */}
        <div className="bg-[#161920] rounded-[2.5rem] shadow-2xl border border-slate-800/80 overflow-hidden">
          {/* Vista Desktop */}
          <table className="hidden sm:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#12141a] border-b border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#1d222e]/30 transition-colors group">
                  <td className="px-6 py-5 font-bold text-slate-200">{p.nombre} {p.apellido}</td>
                  <td className="px-6 py-5 text-sm font-mono text-slate-500 tracking-wide">{p.dni}</td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-300">{p.telefono}</div>
                    <div className="text-xs text-slate-500">{p.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-3 bg-[#12141a] border border-slate-800 text-amber-500 rounded-xl hover:border-amber-500/50 transition-all active:scale-95">✏️</button>
                      
                      <button onClick={() => { setPendingDeleteId(String(p.id)); setConfirmOpen(true); }} className="p-3 bg-[#12141a] border border-slate-800 text-rose-400 rounded-xl hover:bg-rose-950/40 transition-all active:scale-95">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Vista Mobile */}
          <div className="sm:hidden p-4 space-y-4">
             {filtered.map((p) => (
               <div key={p.id} className="bg-[#12141a] p-6 rounded-3xl border border-slate-800/60 space-y-4">
                 <div>
                   <h3 className="font-black text-slate-200 text-lg">{p.nombre} {p.apellido}</h3>
                   <p className="text-xs font-bold text-slate-500">DNI: {p.dni}</p>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => { setEditing(p); setShowModal(true); }} className="flex-1 py-3 bg-[#161920] border border-slate-800 rounded-xl font-bold text-slate-300">Editar</button>
                   <button onClick={() => { setPendingDeleteId(String(p.id)); setConfirmOpen(true); }} className="p-3 bg-rose-950/20 border border-rose-900/20 text-rose-400 rounded-xl hover:bg-rose-900/20 active:scale-95 transition-all">Eliminar</button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* MODALES CON COLORES INTEGRADOS */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#161920] border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[90dvh] overflow-hidden relative">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              
              <div className="bg-[#161920] p-6 md:p-8 shrink-0 pb-2 md:pb-4 border-b border-slate-800 z-10 shadow-sm flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wider">{editing ? "Editar Cliente" : "Nuevo Cliente"}</h2>
                <button onClick={() => { setEditing(null); setShowModal(false); }} className="p-2 bg-[#12141a] rounded-xl text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-800 transition-all"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-hidden bg-[#161920] p-2">
                <PacienteForm initial={editing} onSubmit={handleSubmit} onCancel={() => { setEditing(null); setShowModal(false); }} />
              </div>
            </motion.div>
          </div>
        )}

        {confirmOpen && (
          <ConfirmDialog 
            open={confirmOpen} 
            title="¿Eliminar Cliente?" 
            message="Se borrará toda la información del cliente de forma permanente."
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