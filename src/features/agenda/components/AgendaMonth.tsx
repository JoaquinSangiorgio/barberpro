import { sameDay } from "../lib/date";
import type { Appointment } from "../types";

export default function AgendaMonth({
  date,
  appointments,
  patientsById,
  onPickDay,
  onChangeMonth,
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

  // 🛡️ HELPER NORMALIZADO: Evita el desfase de zona horaria al comparar días
  function toLocalDate(dateISO: string) {
    if (!dateISO) return new Date(0);
    // Reemplazamos espacio por T para asegurar compatibilidad ISO
    const cleanISO = typeof dateISO === 'string' ? dateISO.replace(" ", "T") : dateISO;
    const d = new Date(cleanISO);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const itemsIn = (d: Date) =>
    appointments
      .filter((a) => sameDay(toLocalDate(a.dateISO), d))
      .sort((a, b) => {
        const dateA = new Date(typeof a.dateISO === 'string' ? a.dateISO.replace(" ", "T") : a.dateISO);
        const dateB = new Date(typeof b.dateISO === 'string' ? b.dateISO.replace(" ", "T") : b.dateISO);
        return +dateA - +dateB;
      });

  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  // Helper para mostrar la hora de forma segura
  const formatTime = (iso: string) => {
    const cleanISO = typeof iso === 'string' ? iso.replace(" ", "T") : iso;
    const d = new Date(cleanISO);
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* Selector de mes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-800">
          {months[date.getMonth()]} {date.getFullYear()}
        </h2>
      </div>

      {/* Mobile → Lista de días */}
      <div className="block md:hidden space-y-3">
        {days
          .filter((d) => d.getMonth() === date.getMonth())
          .map((d, i) => {
            const items = itemsIn(d);
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:bg-slate-50" onClick={() => onPickDay?.(d)}>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-bold text-slate-700 capitalize">
                    {d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "short" })}
                  </span>
                  {items.length > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {items.length} turnos
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {items.slice(0, 2).map((a) => (
                    <div key={a.id} className="text-[12px] truncate rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-100">
                      <span className="font-bold">{formatTime(a.dateISO)}</span> · {a.patientName || a.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* Desktop → Calendario mensual */}
      <div className="hidden md:block rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-7 bg-slate-50 border-b">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
            <div key={d} className="p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const isCurrentMonth = d.getMonth() === date.getMonth();
            const items = itemsIn(d);
            const isToday = sameDay(d, new Date());

            return (
              <div
                key={i}
                className={[
                  "min-h-[120px] border-r border-b p-2 transition-colors",
                  !isCurrentMonth ? "bg-slate-50/50 text-slate-300" : "hover:bg-slate-50",
                  isToday && "bg-emerald-50/30",
                ].filter(Boolean).join(" ")}
                onClick={() => onPickDay?.(d)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${isToday ? "bg-emerald-600 text-white w-6 h-6 flex items-center justify-center rounded-full" : ""}`}>
                    {d.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.slice(0, 3).map((a) => (
                    <div key={a.id} className="text-[10px] truncate rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-emerald-800">
                      {formatTime(a.dateISO)} {a.patientName || a.title}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-[9px] font-bold text-slate-400 pl-1">
                      + {items.length - 3} más
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