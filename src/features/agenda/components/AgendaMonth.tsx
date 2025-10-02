import { sameDay } from "../lib/date";
import type { Appointment } from "../types";

export default function AgendaMonth({
  date,
  appointments,
  patientsById,
  onPickDay,
  onChangeMonth, // 👈 nuevo prop opcional para cambiar mes
}: {
  date: Date;
  appointments: Appointment[];
  patientsById: Record<string, { nombre: string; apellido: string }>;
  onPickDay?: (day: Date) => void;
  onChangeMonth?: (month: number, year: number) => void;
}) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() || 7) - 1));
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getTime() + i * 86400000));

  // 🔄 helper para normalizar fechas a día local (ignora UTC offset)
  function toLocalDate(dateISO: string) {
    const d = new Date(dateISO);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const itemsIn = (d: Date) =>
    appointments
      .filter((a) => sameDay(toLocalDate(a.dateISO), d))
      .sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));

  // Lista de meses
  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  return (
    <div className="space-y-4">
      {/* 🔽 Selector de mes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">
          {months[date.getMonth()]} {date.getFullYear()}
        </h2>
      </div>

      {/* 📱 Mobile → lista de días */}
      <div className="block md:hidden space-y-3">
        {days
          .filter((d) => d.getMonth() === date.getMonth())
          .map((d, i) => {
            const items = itemsIn(d);
            return (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-3 border cursor-pointer"
                onClick={() => onPickDay?.(d)}
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold">
                    {d.toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  {items.length > 0 && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                      {items.length} turnos
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {items.slice(0, 2).map((a) => (
                    <div
                      key={a.id}
                      className="text-[12px] truncate rounded bg-emerald-50 px-2 py-1"
                    >
                      {new Date(a.dateISO).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ·{" "}
                      {patientsById[a.patientId]
                        ? `${patientsById[a.patientId].apellido}, ${patientsById[a.patientId].nombre}`
                        : a.title}
                    </div>
                  ))}
                  {items.length > 2 && (
                    <div className="text-[11px] text-slate-500">
                      +{items.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* 💻 Desktop → calendario mensual */}
      <div className="hidden md:block rounded-xl border overflow-hidden bg-white">
        <div className="grid grid-cols-7 bg-slate-50 text-xs">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
            <div key={d} className="p-2 text-center font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const isCurrentMonth = d.getMonth() === date.getMonth();
            const items = itemsIn(d);
            return (
              <div
                key={i}
                className={[
                  "min-h-[140px] border p-2 cursor-pointer",
                  !isCurrentMonth && "bg-slate-50/60 text-slate-500",
                  sameDay(d, new Date()) && "ring-1 ring-emerald-500",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onPickDay?.(d)}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{d.getDate()}</span>
                  {items.length > 0 && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                      {items.length}
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {items.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="text-[11px] truncate rounded bg-emerald-50 px-1 py-0.5"
                    >
                      {new Date(a.dateISO).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ·{" "}
                      {patientsById[a.patientId]
                        ? `${patientsById[a.patientId].apellido}, ${patientsById[a.patientId].nombre}`
                        : a.title}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-[11px] text-slate-500">
                      +{items.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
