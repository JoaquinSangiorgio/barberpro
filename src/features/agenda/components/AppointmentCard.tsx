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
  pending:   "Pendiente",
  confirmed: "Confirmado",
  checked_in:"En consulta",
  completed: "Completado",
  no_show:   "No asistió",
  cancelled: "Cancelado",
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
  const time = `${new Date(appt.dateISO).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit",
  })} · ${appt.durationMin}m`;

  const urgent = appt.isUrgent;

  return (
    <div
      className={`rounded-md border p-2 text-xs shadow-sm transition ${
        clsByStatus[appt.status]
      } ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      } : undefined}
    >
      <div className="flex items-center gap-2">
        <div className="font-medium truncate">{patientName ?? appt.title}</div>

        {urgent && (
          <span className="ml-1 inline-flex items-center rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px]">
            Urgencia
          </span>
        )}

        <span className="ml-1 inline-flex items-center rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium">
          {labelByStatus[appt.status]}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="rounded p-1 hover:bg-emerald-100"
            onClick={(e) => {
              e.stopPropagation();
              // ✅ mantenemos la fecha exacta, solo cambiamos el estado
              onConfirm({ ...appt, dateISO: appt.dateISO, status: "confirmed" });
            }}
            title="Confirmar"
            aria-label="Confirmar turno"
          >
            ✔️
          </button>
          <button
            className="rounded p-1 hover:bg-amber-100"
            onClick={(e) => {
              e.stopPropagation();
              onCancel({ ...appt, dateISO: appt.dateISO, status: "cancelled" });
            }}
            title="Cancelar"
            aria-label="Cancelar turno"
          >
            🚫
          </button>
          {onDelete && (
            <button
              className="rounded p-1 hover:bg-rose-100"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Eliminar"
              aria-label="Eliminar turno"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="opacity-80">{time}</div>
      {appt.reason && <div className="truncate">{appt.reason}</div>}
    </div>
  );
}
