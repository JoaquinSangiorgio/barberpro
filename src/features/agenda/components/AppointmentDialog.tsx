import { useEffect, useMemo, useRef, useState } from "react";
import type { Appointment } from "../types";

type PacienteLite = { id: string; nombre: string; apellido: string };

type Props = {
  open: boolean;
  title?: string;
  initial?: Partial<Appointment>; // si viene con id => editar
  patients: PacienteLite[];
  professionals: string[];
  onClose: () => void;
  onSave: (appt: Appointment | Omit<Appointment, "id">) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  checkOverlap?: (candidate: Appointment, ignoreId?: string) => boolean;
};

// 🔧 Helpers para inputs de fecha/hora
function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function toTimeInputValue(d: Date) {
  return d.toTimeString().slice(0, 5); // HH:mm
}

function composeDateTime(dateStr: string, timeStr: string) {
  return `${dateStr} ${timeStr}:00`; // ej: "2025-09-17 14:30:00"
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

  // valores por defecto
  const def = useMemo(() => {
    const base = initial?.dateISO ? new Date(initial.dateISO) : new Date();
    base.setSeconds(0, 0);
    return {
      patientId: initial?.patientId ?? (patients[0]?.id ?? ""),
      professional: initial?.professional ?? (professionals[0] ?? "Dra. Analia"),
      title: initial?.title ?? "Turno",
      reason: initial?.reason ?? "",
      location: initial?.location ?? "",
      durationMin: initial?.durationMin ?? 30,
      status: initial?.status ?? "pending",
      date: toDateInputValue(base),
      time: toTimeInputValue(base),
    };
  }, [initial, patients, professionals]);

  // states
  const [patientId, setPatientId] = useState<string>(def.patientId);
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
  const dialogRef = useRef<HTMLDivElement>(null);

  // reset cuando se abre
  useEffect(() => {
    setPatientId(def.patientId);
    setProfessional(def.professional);
    setCustomPro("");
    setUseCustomPro(false);
    setTitleField(def.title);
    setReason(def.reason);
    setLocation(def.location);
    setDurationMin(def.durationMin);
    setStatus(def.status);
    setDate(def.date);
    setTime(def.time);
    setErr(null);
  }, [def, open]);

  // cerrar con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!patientId) return setErr("Seleccioná un paciente.");
    if (!date) return setErr("Seleccioná una fecha.");
    if (!time) return setErr("Seleccioná un horario.");

    const pro = useCustomPro ? (customPro.trim() || professional) : professional;
    const date_utc = composeDateTime(date, time);

    const candidate: Appointment = {
      id: (initial?.id as string) ?? "", // si es nuevo => vacío
      title: titleField.trim() || "Turno",
      patientId: String(patientId),
      professional: pro,
      reason: reason.trim(),
      dateISO: date_utc, // 👈 ahora en formato "YYYY-MM-DD HH:mm:ss"
      durationMin: Number(durationMin) || 30,
      status,
      location: location.trim() || "Consultorio 1",
    };

    if (checkOverlap?.(candidate, initial?.id as string)) {
      setErr("El turno se solapa con otro del mismo profesional.");
      return;
    }

    await onSave(isEdit ? candidate : (candidate as Omit<Appointment, "id">));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-labelledby="appt-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialogRef} className="absolute inset-0 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="appt-title" className="text-lg font-semibold">
              {isEdit ? "Editar turno" : "Nuevo turno"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Errores */}
          {err && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Paciente */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Paciente</span>
              <select
                className="h-10 rounded-md border px-2"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </label>

            {/* Profesional */}
            <div className="grid grid-cols-5 items-end gap-2">
              <label className="col-span-3 flex flex-col gap-1">
                <span className="text-sm text-slate-700">Profesional</span>
                <select
                  className="h-10 rounded-md border px-2"
                  value={professional}
                  onChange={(e) => setProfessional(e.target.value)}
                  disabled={useCustomPro}
                >
                  {[...new Set([professional, ...professionals])].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="col-span-2 flex flex-col gap-1">
                <span className="text-sm text-slate-700">o personalizar</span>
                <input
                  className="h-10 rounded-md border px-2"
                  placeholder="Ej: Dra. Pérez"
                  value={customPro}
                  onChange={(e) => {
                    setCustomPro(e.target.value);
                    setUseCustomPro(Boolean(e.target.value.trim()));
                  }}
                />
              </label>
            </div>

            {/* Fecha */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Fecha</span>
              <input
                type="date"
                className="h-10 rounded-md border px-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            {/* Hora */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Hora</span>
              <input
                type="time"
                className="h-10 rounded-md border px-2"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                step={300}
              />
            </label>

            {/* Duración */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Duración</span>
              <select
                className="h-10 rounded-md border px-2"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
              >
                {[15, 20, 30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>

            {/* Estado */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Estado</span>
              <select
                className="h-10 rounded-md border px-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as Appointment["status"])}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="checked_in">En consulta</option>
                <option value="completed">Completado</option>
                <option value="no_show">No asistió</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </label>

            {/* Título */}
            <label className="md:col-span-2 flex flex-col gap-1">
              <span className="text-sm text-slate-700">Título</span>
              <input
                className="h-10 rounded-md border px-2"
                value={titleField}
                onChange={(e) => setTitleField(e.target.value)}
                placeholder="Ej: Control / Limpieza"
              />
            </label>

            {/* Motivo */}
            <label className="md:col-span-2 flex flex-col gap-1">
              <span className="text-sm text-slate-700">Motivo</span>
              <textarea
                className="min-h-[80px] rounded-md border px-2 py-2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Notas / práctica"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-between">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(initial!.id as string)}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
              >
                Eliminar
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-3 py-2 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
              >
                Guardar turno
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
