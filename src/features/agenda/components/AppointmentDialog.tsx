import { useEffect, useMemo, useRef, useState } from "react";
import type { Appointment } from "../types";

type PacienteLite = { id: string; nombre: string; apellido: string };

type Props = {
  open: boolean;
  title?: string;
  initial?: Partial<Appointment>;
  patients: PacienteLite[];
  professionals: string[];
  onClose: () => void;
  onSave: (appt: Appointment | Omit<Appointment, "id">) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  checkOverlap?: (candidate: Appointment, ignoreId?: string) => boolean;
};

// 🔧 HELPERS PARA INPUTS (Normalizados para evitar Invalid Date)
function toDateInputValue(d: Date) {
  if (isNaN(d.getTime())) return ""; 
  return d.toISOString().slice(0, 10);
}

function toTimeInputValue(d: Date) {
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function composeDateTime(dateStr: string, timeStr: string) {
  return `${dateStr} ${timeStr}:00`; // Formato compatible con tu Firestore: "YYYY-MM-DD HH:mm:ss"
}

export default function AppointmentDialog({
  open,
  title = "Turno",
  initial,
  patients,
  professionals,
  onClose,
  onSave,
  onDelete,
  checkOverlap,
}: Props) {
  const isEdit = Boolean(initial?.id);

  // VALORES POR DEFECTO (Con parche para el espacio de Firestore)
  const def = useMemo(() => {
    const rawDate = initial?.dateISO;
    const cleanISO = typeof rawDate === 'string' ? rawDate.replace(" ", "T") : rawDate;
    const base = cleanISO ? new Date(cleanISO) : new Date();
    const safeDate = isNaN(base.getTime()) ? new Date() : base;
    safeDate.setSeconds(0, 0);

    return {
      patientId: initial?.patientId || initial?.patientId || (patients[0]?.id || ""),
      professional: initial?.professional || (professionals[0] || "Dra. Analia"),
      title: initial?.title || "Turno",
      reason: initial?.reason || "",
      location: initial?.location || "Consultorio 1",
      durationMin: initial?.durationMin || 30,
      status: initial?.status || "pending",
      date: toDateInputValue(safeDate),
      time: toTimeInputValue(safeDate),
    };
  }, [initial, patients, professionals]);

  // States
  const [patientId, setPatientId] = useState<string>(String(def.patientId));
  const [professional, setProfessional] = useState(def.professional);
  const [customPro, setCustomPro] = useState("");
  const [useCustomPro, setUseCustomPro] = useState(false);
  const [titleField, setTitleField] = useState(def.title);
  const [reason, setReason] = useState(def.reason);
  const [location, setLocation] = useState(def.location);
  const [durationMin, setDurationMin] = useState<number>(def.durationMin);
  const [status, setStatus] = useState<Appointment["status"]>(def.status);
  const [date, setDate] = useState(def.date);
  const [time, setTime] = useState(def.time);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPatientId(String(def.patientId));
      setProfessional(def.professional);
      setTitleField(def.title);
      setReason(def.reason);
      setLocation(def.location);
      setDurationMin(def.durationMin);
      setStatus(def.status);
      setDate(def.date);
      setTime(def.time);
    }
  }, [def, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!patientId) return setErr("Seleccioná un paciente.");
    
    const pac = patients.find(p => String(p.id) === String(patientId));
    const pro = useCustomPro ? (customPro.trim() || professional) : professional;
    const date_db = composeDateTime(date, time);

    const candidate: any = {
      id: initial?.id || "",
      title: titleField.trim() || "Turno",
      patientId: String(patientId),
      paciente_id: String(patientId), // Guardamos ambos por compatibilidad
      paciente_nombre: pac ? `${pac.nombre} ${pac.apellido}` : (initial?.patientName || "Paciente"),
      professional: pro,
      reason: reason.trim(),
      dateISO: date_db, 
      durationMin: Number(durationMin) || 30,
      status,
      location: location.trim() || "Consultorio 1",
    };

    if (checkOverlap?.(candidate, initial?.id)) {
      setErr("El turno se solapa con otro.");
      return;
    }

    await onSave(candidate);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800">
            {isEdit ? "Editar Turno" : "Nuevo Turno"}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {err && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">{err}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Paciente */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Paciente</label>
            <select
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </div>

          {/* Profesional */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Profesional</label>
            <select
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-emerald-500"
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
            >
              {professionals.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Fecha</label>
            <input
              type="date"
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Hora */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Hora</label>
            <input
              type="time"
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Estado</label>
            <select
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="checked_in">En consulta</option>
              <option value="completed">Completado</option>
              <option value="no_show">No asistió</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Duración */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Duración</label>
            <select
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            >
              {[15, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>

          {/* Motivo */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Motivo / Notas</label>
            <textarea
              className="min-h-[80px] rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Limpieza, perno y corona..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-between gap-3 border-t pt-5">
          {isEdit && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(initial!.id!)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Eliminar Turno
            </button>
          ) : <div />}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              Guardar Turno
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}