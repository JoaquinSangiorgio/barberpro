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
  
  // 🛡️ FILTRO DE SEGURIDAD: Normalizamos las fechas antes de comparar
  const dayAppointments = appointments
    .filter((a) => {
      if (!a.dateISO) return false;
      const dateStr = typeof a.dateISO === 'string' ? a.dateISO.replace(" ", "T") : a.dateISO;
      return sameDay(new Date(dateStr), date);
    })
    .sort((a, b) => {
      const dateA = new Date(typeof a.dateISO === 'string' ? a.dateISO.replace(" ", "T") : a.dateISO);
      const dateB = new Date(typeof b.dateISO === 'string' ? b.dateISO.replace(" ", "T") : b.dateISO);
      return +dateA - +dateB;
    });

  return (
    <div className="grid md:grid-cols-[180px_1fr] rounded-xl border overflow-hidden bg-white shadow-sm">
      {/* 📅 Columna de fecha */}
      <div className="bg-gradient-to-b from-emerald-50 to-sky-50 p-3 md:p-4 border-r">
        <div className="text-sm md:text-base font-bold text-emerald-900">
          {date.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </div>
        <div className="mt-1 text-[10px] uppercase font-bold text-slate-400 hidden sm:block tracking-wider">
          Doble click para agendar
        </div>
      </div>

      {/* 🕒 Agenda */}
      <div className="p-3 md:p-4 space-y-3 bg-gray-50/30">
        {hours.map((h) => {
          const slotStart = new Date(date);
          slotStart.setHours(h, 0, 0, 0);

          // 🛡️ FILTRO POR HORA: Comparamos las horas de forma segura
          const items = dayAppointments.filter((a) => {
            const dateStr = typeof a.dateISO === 'string' ? a.dateISO.replace(" ", "T") : a.dateISO;
            return new Date(dateStr).getHours() === h;
          });

          return (
            <div
              key={h}
              className="flex flex-col md:grid md:grid-cols-[80px_1fr] items-start gap-2 md:gap-3"
            >
              {/* Hora */}
              <div className="text-xs font-bold text-slate-400 py-2">
                {String(h).padStart(2, "0")}:00
              </div>

              {/* Contenedor de turnos */}
              <div
                className="min-h-[60px] rounded-xl border-2 border-dashed border-gray-200 p-2 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer w-full transition-all"
                onDoubleClick={() => {
                  const fechaStr = slotStart.toISOString().split('T')[0];
                  const horaStr = `${String(h).padStart(2, "0")}:00:00`;
                  
                  const draft: Omit<Appointment, "id"> = {
                    patientName: "Nuevo Paciente",
                    patientId: Object.keys(patientsById)[0] ?? "",
                    reason: "",
                    title: "",
                    professional: "",
                    dateISO: `${fechaStr} ${horaStr}`,
                    durationMin: 30,
                    status: "pending",
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
                      // Priorizamos paciente_nombre que viene de Firestore
                      patientName={a.patientName || fullName(patientsById[a.patientId])}
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