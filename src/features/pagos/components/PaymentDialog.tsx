import { useState, useEffect } from "react";
import type { Pago, PacienteLite } from "../services/payments.api";
import { createMPPreference } from "../services/payments.api";

type Props = {
  initial?: Pago;
  pacientes: PacienteLite[];
  onSave: (p: Omit<Pago, "id"> | Pago) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onCancel: () => void;
  onPayWithMP?: (pago: Omit<Pago, "id">) => Promise<void>;
};

export default function PaymentDialog({
  initial,
  pacientes,
  onSave,
  onDelete,
  onCancel,
  onPayWithMP,
}: Props) {
  const [pacienteId, setPacienteId] = useState<number>(
    initial?.paciente_id ?? (pacientes[0]?.id || 0)
  );
  const [fecha, setFecha] = useState(initial?.fecha ?? "");
  const [metodo, setMetodo] = useState<Pago["metodo"]>(
    initial?.metodo ?? "Efectivo"
  );
  const [concepto, setConcepto] = useState(initial?.concepto ?? "");
  const [monto, setMonto] = useState(initial?.monto ?? 0);
  const [status, setStatus] = useState<Pago["status"]>(
    initial?.status ?? "approved"
  );

  const statusLabels: Record<Pago["status"], string> = {
    approved: "Aprobado",
    pending: "Pendiente",
    rejected: "Rechazado",
  };

  const statusMap: Record<string, Pago["status"]> = {
    Aprobado: "approved",
    Pendiente: "pending",
    Rechazado: "rejected",
  };

  useEffect(() => {
    if (initial) {
      setPacienteId(initial.paciente_id);
      setFecha(initial.fecha);
      setMetodo(initial.metodo);
      setConcepto(initial.concepto);
      setMonto(initial.monto);
      setStatus(initial.status);
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      paciente_id: pacienteId,
      fecha,
      metodo,
      concepto,
      monto,
      status,
    };
    if (initial) {
      await onSave({ ...payload, id: initial.id });
    } else {
      await onSave(payload);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-lg w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">
            {initial ? "Editar Pago" : "Nuevo Pago"}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700 text-xl md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Paciente *
            </label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value={0}>Selecciona un paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Concepto
            </label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Concepto del pago"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto
            </label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Método */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Método de pago
            </label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as Pago["metodo"])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Débito</option>
              <option>Crédito</option>
              <option>Mercado Pago</option>
              <option>Otro</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado
            </label>
            <select
              value={statusLabels[status]}
              onChange={(e) => setStatus(statusMap[e.target.value])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option>Aprobado</option>
              <option>Pendiente</option>
              <option>Rechazado</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              onClick={onCancel}
            >
              Cancelar
            </button>

            {initial && onDelete && (
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                onClick={() => onDelete(initial.id)}
              >
                Eliminar
              </button>
            )}

            {/* 👇 Mostrar solo si es Mercado Pago y está Pendiente */}
            {onPayWithMP && metodo === "Mercado Pago" && status === "pending" && (
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                onClick={async () => {
                  try {
                    const pref = await createMPPreference({
                      paciente_id: pacienteId,
                      concepto: concepto || "Pago odontológico",
                      monto: Number(monto),
                      cantidad: 1,
                    });
                    window.open(pref.init_point, "_blank");
                  } catch (err) {
                    alert("Error creando pago con MP: " + err);
                  }
                }}
              >
                Pagar con MP
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
