"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence,  } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  Plus, 
  X, 
  Trash2, 
  CheckCircle2, 
} from "lucide-react";

import { listPacientes, type Paciente } from "../../pacientes/services/pacientes.api";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../agenda/services/appointments.api";

import ConfirmDialog from "../../../shared/components/ConfirmDialog";

// ======================================================================
// 🟦 COMPONENTES AUXILIARES
// ======================================================================
function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-amber-600 text-white px-6 py-3 rounded-xl shadow-[0_10px_30px_rgba(217,119,6,0.3)] flex items-center gap-3 font-black uppercase text-xs tracking-wider border border-amber-500/30"
    >
      <CheckCircle2 className="w-4 h-4 text-white" />
      <span>{message}</span>
    </motion.div>
  );
}

function formatearFecha(d: Date) {
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

// Colores de turnos adaptados a la paleta Barber Dark
function estadoColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-[#182520] border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50";
    case "pending":   return "bg-[#251f15] border-amber-500/20 text-amber-400 hover:border-amber-500/40";
    case "cancelled": return "bg-[#251517] border-rose-500/20 text-rose-400 hover:border-rose-500/40";
    case "completed": return "bg-[#171c2b] border-indigo-500/20 text-indigo-400 hover:border-indigo-500/40";
    default:          return "bg-[#1a1e26] border-slate-800 text-slate-300 hover:border-slate-700";
  }
}

// Mapas visuales para las etiquetas limpias
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado"
};

const STATE_DOTS: Record<string, string> = {
  confirmed: "bg-emerald-400",
  pending: "bg-amber-400",
  cancelled: "bg-rose-400",
  completed: "bg-indigo-400"
};

// ======================================================================
// 🟢 COMPONENTE PRINCIPAL
// ======================================================================
export default function AgendaPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [turno, setTurno] = useState<any>({
    paciente_id: "",
    reason: "",
    status: "pending",
    durationMin: 30,
    fechaStr: "",
    horaStr: "09:00",
  });

  useEffect(() => {
    listPacientes().then(setPacientes);
    cargarTurnos();
  }, []);

  async function cargarTurnos() {
    const data = await listAppointments();
    setTurnos([...data]); 
  }

  const cambiarMes = (offset: number) => {
    const nuevaFecha = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(nuevaFecha);
  };

  const turnosDelDia = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const hoyStr = `${y}-${m}-${d}`;

    return turnos.filter((t) => {
      if (!t.dateISO) return false;
      const fechaTurno = t.dateISO.replace("T", " ").split(" ")[0].trim();
      return fechaTurno === hoyStr;
    }).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, [turnos, selectedDate]);

  const diasConTurnos = useMemo(() => {
    return new Set(
      turnos.filter(t => t.dateISO).map(t => t.dateISO.split(/[ T]/)[0])
    );
  }, [turnos]);

  const handleSave = async () => {
    const pac = pacientes.find(p => String(p.id) === String(turno.paciente_id));
    const payload: any = {
      paciente_id: String(turno.paciente_id),
      paciente_nombre: pac ? `${pac.nombre} ${pac.apellido}` : (turno.paciente_nombre || "Cliente"),
      reason: turno.reason || "",
      status: turno.status || "pending",
      durationMin: Number(turno.durationMin) || 30,
      dateISO: `${turno.fechaStr} ${turno.horaStr}:00`,
    };

    let res;
    if (modalMode === "edit") {
      payload.id = turno.id || turno.db_id;
      res = await updateAppointment(payload);
    } else {
      res = await createAppointment(payload);
    }

    if (res.status === "success" || res.status === "ok") {
      await cargarTurnos(); 
      setShowModal(false);
      setToastMsg(modalMode === "create" ? "Turno Agendado ✅" : "Turno Actualizado ✅");
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const openCreate = () => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    setTurno({
      paciente_id: "",
      reason: "",
      status: "pending",
      durationMin: 30,
      fechaStr: `${y}-${m}-${d}`,
      horaStr: "09:00",
    });
    setModalMode("create");
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setTurno({
      ...t,
      fechaStr: t.dateISO.split(/[ T]/)[0],
      horaStr: t.dateISO.split(/[ T]/)[1].substring(0, 5),
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const renderCalendar = () => {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const startDay = (start.getDay() + 6) % 7;
    const cells = Array(startDay).fill(null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

    return (
      <div className="grid grid-cols-7 gap-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
          <div key={`h-${i}`} className="text-[10px] font-black text-slate-500 text-center py-2 uppercase tracking-widest">{day}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const y = selectedDate.getFullYear();
          const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const dayStr = String(d).padStart(2, "0");
          const fullDateKey = `${y}-${m}-${dayStr}`;
          const isSelected = selectedDate.getDate() === d;

          return (
            <button
              key={`d-${i}`}
              onClick={() => setSelectedDate(new Date(y, selectedDate.getMonth(), d))}
              className={`relative h-9 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                isSelected 
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-950/50 font-black scale-105 border border-amber-500/30" 
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              {d}
              {diasConTurnos.has(fullDateKey) && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-amber-500"}`} />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-100 flex flex-col md:flex-row overflow-x-hidden">
      <AnimatePresence>{toastMsg && <Toast message={toastMsg} />}</AnimatePresence>

      {/* ASIDE RESPONSIVO (BARBER INTERFACE) */}
      <aside className="w-full md:w-80 bg-[#161920] border-b md:border-b-0 md:border-r border-slate-800/60 p-6 flex flex-col gap-6 md:sticky md:top-0 md:h-screen z-10">
        <div className="flex items-center gap-3 relative">
          <div className="absolute top-[-24px] left-[-24px] right-[-24px] h-[3px] bg-gradient-to-r from-red-600 via-white to-blue-600 opacity-50 md:block hidden" />
          <div className="bg-amber-600/10 border border-amber-500/20 p-2.5 rounded-xl text-amber-500 shadow-inner">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-amber-500 tracking-widest uppercase font-sans">Agenda</h1>
        </div>
        
        <div className="flex items-center justify-between bg-[#12141a] p-1.5 rounded-xl border border-slate-800/80">
          <button onClick={() => cambiarMes(-1)} className="p-2 hover:bg-[#1d222e] rounded-lg text-slate-400 transition-all active:scale-95"><ChevronLeft className="w-4 h-4" /></button>
          <p className="font-black text-slate-200 capitalize text-xs tracking-wider">
            {selectedDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </p>
          <button onClick={() => cambiarMes(1)} className="p-2 hover:bg-[#1d222e] rounded-lg text-slate-400 transition-all active:scale-95"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Calendar Grid Dinámico */}
        <div className="bg-[#12141a]/50 border border-slate-800/40 p-4 rounded-2xl shadow-inner">
          {renderCalendar()}
        </div>

        <button 
          onClick={openCreate} 
          className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black shadow-lg shadow-amber-950/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest mt-4 md:mt-auto border border-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Nuevo Turno
        </button>
      </aside>

      {/* MAIN CONTENT (LISTADO DE CORTES DEL DÍA) */}
      <main className="flex-1 p-6 md:p-12 w-full max-w-5xl md:pl-12">
        <header className="mb-8 relative pb-4 border-b border-slate-800/60">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.25em] mb-1.5">Hoja de Ruta</p>
          <h2 className="text-2xl md:text-3xl font-black text-white capitalize tracking-tight leading-none">{formatearFecha(selectedDate)}</h2>
        </header>

        {turnosDelDia.length === 0 ? (
          <div className="bg-[#161920] p-14 md:p-24 rounded-2xl border border-slate-800/80 text-center flex flex-col items-center gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            <div className="w-14 h-14 bg-[#12141a] border border-slate-800 rounded-full flex items-center justify-center text-slate-600 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">No hay turnos agendados en este día</p>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {turnosDelDia.map((t) => (
              <motion.div
                key={t.id || t.db_id}
                layoutId={t.id}
                onClick={() => openEdit(t)}
                className={`group p-5 md:p-6 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] flex justify-between items-center bg-gradient-to-r from-[#161920] to-[#12141a] ${estadoColor(t.status)}`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-base md:text-lg tracking-wide uppercase group-hover:text-white transition-colors">{t.paciente_nombre}</h4>
                    <span className="text-[9px] font-black uppercase px-2.5 py-0.5 bg-[#0f1115]/60 rounded-md border border-slate-800/50 tracking-wider">
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold bg-[#0f1115]/40 px-2.5 py-1 rounded-lg border border-slate-800/30 text-slate-300">
                      <Clock className="w-3.5 h-3.5 opacity-60 text-amber-500" />
                      {t.dateISO.split(/[ T]/)[1].substring(0, 5)} hs
                    </div>
                    {t.reason && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <FileText className="w-3.5 h-3.5 opacity-50" />
                        {t.reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 opacity-30 group-hover:opacity-100 text-slate-400 group-hover:text-white transition-all duration-200">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL RESPONSIVO FORMULARIO BARBER (Bottom sheet en mobile, Centrado en desktop) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="bg-[#161920] border-t md:border border-slate-800 w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative"
            >
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-wider">
                  {modalMode === "create" ? "Nuevo Turno" : "Editar Turno"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 bg-[#12141a] rounded-xl text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-800 transition-all"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4">
                {/* Selector de Cliente */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Cliente</label>
                  <select 
                    className="w-full bg-[#12141a] border border-slate-800 rounded-xl p-3.5 font-bold outline-none focus:border-amber-500 text-slate-200 text-sm transition-all" 
                    value={turno.paciente_id} 
                    onChange={(e) => setTurno({...turno, paciente_id: e.target.value})}
                  >
                    <option value="" className="bg-[#161920]">Seleccionar Cliente...</option>
                    {pacientes.map(p => <option key={p.id} value={p.id} className="bg-[#161920]">{p.nombre} {p.apellido}</option>)}
                  </select>
                </div>
                
                {/* Inputs de Fecha y Hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Fecha</label>
                    <input type="date" className="w-full bg-[#12141a] border border-slate-800 rounded-xl p-3.5 font-bold outline-none focus:border-amber-500 text-slate-200 text-sm transition-all" value={turno.fechaStr} onChange={(e) => setTurno({...turno, fechaStr: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Hora</label>
                    <input type="time" className="w-full bg-[#12141a] border border-slate-800 rounded-xl p-3.5 font-bold outline-none focus:border-amber-500 text-slate-200 text-sm transition-all" value={turno.horaStr} onChange={(e) => setTurno({...turno, horaStr: e.target.value})} />
                  </div>
                </div>

                {/* Input de Práctica o Razón Opcional (Manteniendo la consistencia) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Servicio / Motivo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Corte + Barba" 
                    className="w-full bg-[#12141a] border border-slate-800 rounded-xl p-3.5 font-bold outline-none focus:border-amber-500 text-slate-200 text-sm transition-all" 
                    value={turno.reason} 
                    onChange={(e) => setTurno({...turno, reason: e.target.value})} 
                  />
                </div>

                {/* Selector de Estado */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Estado del Turno</label>
                  <select 
                    className="w-full bg-[#12141a] border border-slate-800 rounded-xl p-3.5 font-bold outline-none focus:border-amber-500 text-slate-200 text-sm transition-all" 
                    value={turno.status} 
                    onChange={(e) => setTurno({...turno, status: e.target.value})}
                  >
                    <option value="pending" className="bg-[#161920]">Pendiente </option>
                    <option value="confirmed" className="bg-[#161920]">Confirmado </option>
                    <option value="completed" className="bg-[#161920]">Completado </option>
                    <option value="cancelled" className="bg-[#161920]">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                {modalMode === "edit" && (
                  <button 
                    onClick={() => { setDeleteId(turno.id || turno.db_id); setConfirmOpen(true); }} 
                    className="w-full sm:w-auto px-5 py-3.5 bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-900/30 rounded-xl font-bold flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest transition-all"
                  >
                    <Trash2 className="w-4 h-4"/> Cancelar Turno
                  </button>
                )}
                <button 
                  onClick={handleSave} 
                  className="flex-1 py-3.5 bg-amber-600 text-white rounded-xl font-black shadow-lg shadow-amber-950/40 hover:bg-amber-500 active:scale-[0.98] transition-all uppercase text-[11px] tracking-widest border border-amber-500/20"
                >
                  Confirmar Turno
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Remover turno de la agenda?"
        message="Esta acción vaciará el lugar asignado en el sillón de forma permanente."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteAppointment(deleteId);
            await cargarTurnos();
            setShowModal(false);
          }
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}