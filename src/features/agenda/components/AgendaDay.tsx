import AppointmentCard from "./AppointmentCard";
import { hours, sameDay } from "../lib/date";
import type { Appointment } from "../types";

export default function AgendaDay({
  date,
  appointments,
  patientsById,
  onAdd,
  onUpdate,
  onDelete,
}: {
  date: Date;
  appointments: Appointment[];
  patientsById: Record<string, { nombre: string; apellido: string }>;
  onAdd: (a: Omit<Appointment, "id">) => void;
  onUpdate: (a: Appointment) => void;
  onDelete?: (id: string) => void;
}) {
  const dayAppointments = appointments
    .filter((a) => sameDay(new Date(a.dateISO), date))
    .sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));

  return (
    <div className="grid md:grid-cols-[180px_1fr] rounded-xl border overflow-hidden bg-white">
      {/* 📅 Columna de fecha */}
      <div className="bg-gradient-to-b from-emerald-50 to-sky-50 p-3 md:p-4">
        <div className="text-sm md:text-base font-semibold">
          {date.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </div>
        <div className="mt-1 text-xs text-slate-500 hidden sm:block">
          Doble click en franja para agregar
        </div>
      </div>

      {/* 🕒 Agenda */}
      <div className="p-3 md:p-4 space-y-3">
        {hours.map((h) => {
          const slotStart = new Date(date);
          slotStart.setHours(h, 0, 0, 0);
          const items = dayAppointments.filter(
            (a) => new Date(a.dateISO).getHours() === slotStart.getHours()
          );
          return (
            <div
              key={h}
              className="flex flex-col md:grid md:grid-cols-[80px_1fr] items-start gap-2 md:gap-3"
            >
              {/* Hora */}
              <div className="text-xs md:text-sm text-slate-500">
                {String(h).padStart(2, "0")}:00
              </div>

              {/* Contenedor de turnos */}
              <div
                className="min-h-12 rounded-md border border-dashed p-2 hover:bg-slate-50 cursor-pointer w-full"
                onDoubleClick={() => {
                  const draft: Omit<Appointment, "id"> = {
                    title: "Turno",
                    patientId: Object.keys(patientsById)[0] ?? "",
                    professional: "Dra. Analia",
                    reason: "",
                    dateISO: slotStart.toISOString(),
                    durationMin: 30,
                    status: "pending",
                    location: "Consultorio 1",
                  };
                  onAdd(draft);
                }}
                title="Doble click para agregar turno"
              >
                <div className="flex flex-col gap-2">
                  {items.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appt={a}
                      patientName={fullName(patientsById[a.patientId])}
                      onConfirm={onUpdate}
                      onCancel={onUpdate}
                      onDelete={onDelete ? () => onDelete(a.id) : undefined}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fullName(p?: { nombre: string; apellido: string }) {
  return p ? `${p.apellido}, ${p.nombre}` : undefined;
}
