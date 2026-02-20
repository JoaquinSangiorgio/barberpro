import { useMemo } from "react";
import AppointmentCard from "./AppointmentCard";
import type { Appointment } from "../types";

type Props = {
  date: Date;
  appointments: Appointment[];
  patientsById: Record<string, { nombre: string; apellido: string }>;
  onAdd: (draft: Partial<Appointment> & { dateISO?: string }) => void;
  onUpdate: (a: Appointment) => void;
  onEdit?: (a: Appointment) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
};

export default function AgendaWeek({
  date,
  appointments,
  patientsById,
  onAdd,
  onUpdate,
  onEdit,
  onDelete,
  compact = false,
}: Props) {
  
  // 🛡️ Helper para normalizar fechas de Firestore ("YYYY-MM-DD HH:mm:ss" -> ISO)
  const normalizeDate = (iso: string) => {
    if (!iso) return new Date(0);
    return new Date(typeof iso === 'string' ? iso.replace(" ", "T") : iso);
  };

  // lunes de la semana
  const startOfWeek = useMemo(() => {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [date]);

  const days = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 86400000));

  // Rango horario dinámico
  const { startHour, endHour } = useMemo(() => {
    const fallback = { startHour: 8, endHour: 20 };
    if (!compact || appointments.length === 0) return fallback;

    const wStart = startOfWeek.getTime();
    const wEnd = wStart + 7 * 86400000;
    let minH = 23, maxH = 0;

    for (const a of appointments) {
      const t = normalizeDate(a.dateISO).getTime();
      if (t < wStart || t >= wEnd) continue;
      const h0 = normalizeDate(a.dateISO).getHours();
      const h1 = new Date(t + a.durationMin * 60000).getHours();
      minH = Math.min(minH, h0);
      maxH = Math.max(maxH, h1);
    }

    if (minH > maxH) return fallback;
    minH = Math.max(7, minH - 1);
    maxH = Math.min(21, Math.max(maxH + 1, minH + 6));
    return { startHour: minH, endHour: maxH };
  }, [appointments, startOfWeek, compact]);

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour]
  );

  function openNew(day: Date, hour: number) {
    const d = new Date(day);
    d.setHours(hour, 0, 0, 0);
    // Formato compatible con tu base de datos actual
    const dateStr = d.toISOString().replace('T', ' ').substring(0, 19);
    onAdd({ dateISO: dateStr });
  }

  return (
    <>
      {/* 📱 Vista mobile */}
      <div className="block md:hidden space-y-4">
        {days.map((d, i) => {
          const daily = appointments
            .filter((a) => normalizeDate(a.dateISO).toDateString() === d.toDateString())
            .sort((a, b) => +normalizeDate(a.dateISO) - +normalizeDate(b.dateISO));

          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
              <h3 className="font-bold text-emerald-800 text-sm capitalize">
                {d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "2-digit" })}
              </h3>
              {daily.length === 0 && <div className="text-xs text-slate-400 italic">Sin turnos agendados</div>}
              {daily.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appt={a}
                  patientName={a.patientName || (patientsById[String(a.patientId)] ? `${patientsById[String(a.patientId)].apellido}, ${patientsById[String(a.patientId)].nombre}` : undefined)}
                  onConfirm={onUpdate}
                  onCancel={onUpdate}
                  onClick={() => onEdit?.(a)}
                  onDelete={onDelete ? () => onDelete(String(a.id)) : undefined}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* 💻 Vista escritorio */}
      <div className="hidden md:block w-full overflow-auto rounded-2xl border bg-white shadow-sm">
        <div className="min-w-[1040px] grid grid-cols-[100px_repeat(7,1fr)]">
          <div className="sticky left-0 z-10 bg-slate-50 border-r p-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hora</div>
          {days.map((d, i) => (
            <div key={i} className="p-3 text-center text-sm font-bold border-r bg-slate-50/50">
              {d.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" })}
            </div>
          ))}

          {hours.map((h) => (
            <div key={h} className="contents">
              <div className="border-t border-r p-2 text-xs font-bold text-slate-400 bg-white">
                {String(h).padStart(2, "0")}:00
              </div>
              {days.map((d, idx) => {
                const slotStart = new Date(d); slotStart.setHours(h, 0, 0, 0);
                const slotEnd = new Date(d);   slotEnd.setHours(h + 1, 0, 0, 0);

                const items = appointments
                  .filter((a) => {
                    const t = normalizeDate(a.dateISO);
                    return t >= slotStart && t < slotEnd;
                  })
                  .sort((a, b) => +normalizeDate(a.dateISO) - +normalizeDate(b.dateISO));

                return (
                  <div key={`${h}-${idx}`} className="relative border-t border-r p-2 min-h-[80px] hover:bg-emerald-50/30 transition-colors cursor-pointer" onDoubleClick={() => openNew(d, h)}>
                    <div className="flex flex-col gap-2">
                      {items.map((a) => (
                        <AppointmentCard
                          key={a.id}
                          appt={a}
                          patientName={a.patientName || (patientsById[String(a.patientId)] ? `${patientsById[String(a.patientId)].apellido}, ${patientsById[String(a.patientId)].nombre}` : undefined)}
                          onConfirm={onUpdate}
                          onCancel={onUpdate}
                          onClick={() => onEdit?.(a)}
                          onDelete={onDelete ? () => onDelete(String(a.id)) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}