import type { Appointment } from "../types";

const clsByStatus: Record<Appointment["status"], string> = {
  pending:    "bg-amber-50 border-amber-200 text-amber-900",
  confirmed:  "bg-emerald-50 border-emerald-200 text-emerald-900",
  checked_in: "bg-blue-50 border-blue-200 text-blue-900",
  completed:  "bg-slate-50 border-slate-200 text-slate-800",
  no_show:    "bg-gray-50 text-gray-500",
  cancelled:  "bg-rose-50 border-rose-200 text-rose-900 opacity-70 line-through",
};

const labelByStatus: Record<Appointment["status"], string> = {
  pending:    "Pendiente",
  confirmed:  "Confirmado",
  checked_in: "En consulta",
  completed:  "Completado",
  no_show:    "No asistió",
  cancelled:  "Cancelado",
};

type Props = {
  appt: Appointment;
  patientName?: string;
  onConfirm: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
  onDelete?: () => void;
  onClick?: () => void;
};

export default function AppointmentCard({
  appt, patientName, onConfirm, onCancel, onDelete, onClick,
}: Props) {
  
  // 🛡️ CORRECCIÓN DE FECHA: Normalizamos el string para evitar 'Invalid Date'
  const dateStr = typeof appt.dateISO === 'string' 
    ? appt.dateISO.replace(" ", "T") 
    : appt.dateISO;
    
  const dateObj = new Date(dateStr);
  
  // Verificamos si la fecha es válida antes de formatear
  const time = !isNaN(dateObj.getTime())
    ? `${dateObj.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} · ${appt.durationMin}m`
    : "Hora no definida";

  return (
    <div
      className={`rounded-xl border p-3 text-xs shadow-sm transition-all ${
        clsByStatus[appt.status] || "bg-white border-gray-200"
      } ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        {/* Priorizamos el nombre del paciente de Firestore */}
        <div className="font-bold truncate text-sm">
          {patientName || appt.patientName || appt.title || "Sin nombre"}
        </div>

        <span className="ml-auto inline-flex items-center rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase">
          {labelByStatus[appt.status]}
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div className="font-medium opacity-70">{time}</div>
          {appt.reason && <div className="truncate italic mt-0.5">{appt.reason}</div>}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="rounded-lg p-1.5 hover:bg-emerald-200/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm({ ...appt, status: "confirmed" });
            }}
            title="Confirmar"
          >
            ✔️
          </button>
          <button
            className="rounded-lg p-1.5 hover:bg-rose-200/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onCancel({ ...appt, status: "cancelled" });
            }}
            title="Cancelar"
          >
            🚫
          </button>
          {onDelete && (
            <button
              className="rounded-lg p-1.5 hover:bg-gray-200 transition-colors"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Eliminar"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}