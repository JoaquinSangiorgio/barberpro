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
  // lunes de la semana
  const startOfWeek = useMemo(() => {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [date]);

  const days = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 86400000));

  // rango horario
  const { startHour, endHour } = useMemo(() => {
    const fallback = { startHour: 8, endHour: 20 };
    if (!compact || appointments.length === 0) return fallback;

    const wStart = startOfWeek.getTime();
    const wEnd = wStart + 7 * 86400000;
    let minH = 23, maxH = 0;

    for (const a of appointments) {
      const t = new Date(a.dateISO).getTime();
      if (t < wStart || t >= wEnd) continue;
      const h0 = new Date(a.dateISO).getHours();
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

  function fullName(p?: { nombre: string; apellido: string }) {
    return p ? `${p.apellido}, ${p.nombre}` : undefined;
  }

  function openNew(day: Date, hour: number) {
    const dt = new Date(day);
    dt.setHours(hour, 0, 0, 0);
    onAdd({ dateISO: dt.toISOString() });
  }

  return (
    <>
      {/* 📱 Vista mobile → cards por día */}
      <div className="block md:hidden space-y-4">
        {days.map((d, i) => {
          const daily = appointments
            .filter((a) => {
              const t = new Date(a.dateISO);
              return t.toDateString() === d.toDateString();
            })
            .sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));

          return (
            <div key={i} className="bg-white rounded-lg shadow border p-4 space-y-3">
              <h3 className="font-semibold text-slate-700 text-sm">
                {d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "2-digit" })}
              </h3>
              {daily.length === 0 && (
                <div className="text-xs text-slate-500">Sin turnos</div>
              )}
              {daily.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appt={a}
                  patientName={fullName(patientsById[String(a.patientId)])}
                  onConfirm={onUpdate}
                  onCancel={onUpdate}
                  onClick={() => onEdit?.(a)}
                  onDelete={onDelete ? () => onDelete(String(a.id)) : undefined}
                />
              ))}
              <button
                className="mt-2 text-xs text-sky-600 hover:underline"
                onClick={() => openNew(d, 9)}
              >
                + Agregar turno
              </button>
            </div>
          );
        })}
      </div>

      {/* 💻 Vista escritorio → tabla semanal */}
      <div className="hidden md:block w-full overflow-auto rounded-xl border bg-white">
        <div className="min-w-[1040px] grid grid-cols-[120px_repeat(7,1fr)]">
          <div className="sticky left-0 z-10 bg-emerald-50/60 border-r p-3 text-sm font-medium">Hora</div>
          {days.map((d, i) => (
            <div key={i} className="p-3 text-center text-sm border-r">
              {d.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" })}
            </div>
          ))}

          {hours.map((h) => (
            <div key={h} className="contents">
              <div className="border-t border-r p-2 text-xs text-slate-500">
                {String(h).padStart(2, "0")}:00
              </div>
              {days.map((d, idx) => {
                const slotStart = new Date(d); slotStart.setHours(h, 0, 0, 0);
                const slotEnd = new Date(d);   slotEnd.setHours(h + 1, 0, 0, 0);

                const items = appointments
                  .filter((a) => {
                    const t = new Date(a.dateISO);
                    return t >= slotStart && t < slotEnd;
                  })
                  .sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));

                return (
                  <div
                    key={`${h}-${idx}`}
                    className="relative border-t border-r p-2 min-h-[72px] hover:bg-slate-50 cursor-pointer"
                    onDoubleClick={() => openNew(d, h)}
                    title="Doble click para agregar turno"
                  >
                    <div className="flex flex-col gap-2">
                      {items.map((a) => (
                        <AppointmentCard
                          key={a.id}
                          appt={a}
                          patientName={fullName(patientsById[String(a.patientId)])}
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

        {compact && (
          <div className="px-3 py-2 text-xs text-slate-500">
            Mostrando {startHour}:00–{endHour}:00 (modo compacto).
          </div>
        )}
      </div>
    </>
  );
}
