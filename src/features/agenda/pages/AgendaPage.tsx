"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
function Toast({ message, icon }: { message: string; icon?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-4 right-4 z-[9999] bg-white text-gray-900 px-4 py-3 rounded-xl shadow-lg border border-gray-200 flex items-center gap-2 text-sm font-medium"
    >
      <span className="text-green-600 text-lg">✔️</span>
      <span>{message}</span>
      {icon && <span className="text-gray-400 text-lg">{icon}</span>}
    </motion.div>
  );
}

function formatearFecha(d: Date) {
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

function estadoColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-100 border-emerald-400";
    case "pending":   return "bg-amber-100 border-amber-400";
    case "cancelled": return "bg-red-100 border-red-400";
    case "completed": return "bg-blue-100 border-blue-500";
    default:          return "bg-gray-50 border-gray-300";
  }
}

function renderBadge(status: string) {
  const base = "ml-2 text-[10px] px-2 py-0.5 rounded-full text-white uppercase font-bold";
  switch (status) {
    case "completed": return <span className={`${base} bg-blue-700`}>Completado</span>;
    case "confirmed": return <span className={`${base} bg-emerald-700`}>Confirmado</span>;
    case "pending":   return <span className={`${base} bg-amber-600`}>Pendiente</span>;
    case "cancelled": return <span className={`${base} bg-red-600`}>Cancelado</span>;
    default:          return null;
  }
}

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

  // Navegación de meses
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
    });
  }, [turnos, selectedDate]);

  const diasConTurnos = useMemo(() => {
    return new Set(
      turnos
        .filter(t => t.dateISO)
        .map(t => {
          const d = t.dateISO.replace("T", " ").split(" ")[0].split("-");
          // Guardamos el formato YYYY-MM-DD para comparar con el calendario
          return `${d[0]}-${d[1]}-${d[2]}`;
        })
    );
  }, [turnos]);

  // ======================================================================
  // ACCIONES
  // ======================================================================
  const handleSave = async () => {
    const pac = pacientes.find(p => String(p.id) === String(turno.paciente_id));
    const payload: any = {
      paciente_id: String(turno.paciente_id),
      paciente_nombre: pac ? `${pac.nombre} ${pac.apellido}` : (turno.paciente_nombre || "Paciente"),
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
      setTurnos([]); 
      await cargarTurnos(); 
      setShowModal(false);
      setToastMsg(modalMode === "create" ? "Cita creada" : "Cita actualizada");
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

  // ======================================================================
  // RENDER CALENDARIO
  // ======================================================================
  const renderCalendar = () => {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const startDay = (start.getDay() + 6) % 7;
    const cells = Array(startDay).fill(null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

    return (
      <div className="grid grid-cols-7 gap-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
          <div key={`h-${i}`} className="text-[10px] font-bold text-slate-400 text-center py-2">{day}</div>
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
              className={`relative h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                isSelected ? "bg-emerald-600 text-white shadow-lg" : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {d}
              {diasConTurnos.has(fullDateKey) && (
                <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-emerald-400"}`} />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AnimatePresence>{toastMsg && <Toast message={toastMsg} />}</AnimatePresence>

      <aside className="w-full md:w-80 bg-white border-r p-6 flex flex-col gap-6 sticky top-0 h-screen overflow-y-auto">
        <h1 className="text-2xl font-black text-slate-800">Agenda.</h1>
        
        {/* NAVEGADOR DE MES */}
        <div className="flex items-center justify-between px-2">
          <button onClick={() => cambiarMes(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">❮</button>
          <p className="font-black text-slate-700 capitalize">
            {selectedDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </p>
          <button onClick={() => cambiarMes(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">❯</button>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Día Seleccionado</p>
          <p className="font-bold text-slate-800 capitalize">{formatearFecha(selectedDate)}</p>
        </div>

        {renderCalendar()}
        
        <button onClick={openCreate} className="mt-auto w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 active:scale-95 transition-all">
          + Nuevo Turno
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-black text-slate-800 mb-8">Turnos del día</h2>
        {turnosDelDia.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-medium">
            No hay turnos para este día.
          </div>
        ) : (
          <div className="grid gap-4">
            {turnosDelDia.map((t) => (
              <motion.div
                key={t.id || t.db_id}
                layoutId={t.id}
                onClick={() => openEdit(t)}
                className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all hover:shadow-md flex justify-between items-center ${estadoColor(t.status)}`}
              >
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-start">
                    <p className="font-black text-xl text-slate-900">{t.paciente_nombre}</p>
                    {renderBadge(t.status)}
                  </div>
                  <div className="text-sm font-bold text-slate-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="bg-white/60 px-2 py-0.5 rounded-lg border border-black/5 flex items-center gap-1">
                      🕒 {t.dateISO.split(/[ T]/)[1].substring(0, 5)} hs
                    </span>
                    {t.reason && (
                      <span className="flex items-center gap-1 opacity-80">
                        📝 <span className="italic">{t.reason}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xl opacity-20 ml-4 font-bold">❯</div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL Y CONFIRM DIALOG SE MANTIENEN IGUAL... */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <h3 className="text-2xl font-black">{modalMode === "create" ? "Nueva Cita" : "Editar Cita"}</h3>
              <div className="space-y-4">
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500" value={turno.paciente_id} onChange={(e) => setTurno({...turno, paciente_id: e.target.value})}>
                  <option value="">Seleccionar Paciente...</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none" value={turno.fechaStr} onChange={(e) => setTurno({...turno, fechaStr: e.target.value})} />
                  <input type="time" className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none" value={turno.horaStr} onChange={(e) => setTurno({...turno, horaStr: e.target.value})} />
                </div>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none" placeholder="Motivo..." value={turno.reason} onChange={(e) => setTurno({...turno, reason: e.target.value})} />
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none" value={turno.status} onChange={(e) => setTurno({...turno, status: e.target.value})}>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                {modalMode === "edit" && (
                  <button onClick={() => { setDeleteId(turno.id || turno.db_id); setConfirmOpen(true); }} className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors">Eliminar</button>
                )}
                <button onClick={handleSave} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">Guardar</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Borrar turno?"
        message="Esta acción eliminará el registro de Firebase."
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