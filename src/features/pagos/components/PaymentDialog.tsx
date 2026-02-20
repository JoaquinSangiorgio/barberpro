import { useState, useEffect } from "react";
import type { Pago, PacienteLite } from "../services/payments.api";
import { createMPPreference } from "../services/payments.api";

type Props = {
  initial?: Pago;
  pacientes: PacienteLite[];
  onSave: (p: Omit<Pago, "id"> | Pago) => Promise<void>;
  onDelete?: (id: string) => Promise<void>; 
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
 
  const [pacienteId, setPacienteId] = useState<string>(
    initial?.paciente_id ? String(initial.paciente_id) : (pacientes[0]?.id ? String(pacientes[0].id) : "")
  );
  
  const [fecha, setFecha] = useState(initial?.fecha ?? new Date().toISOString().split('T')[0]);
  const [metodo, setMetodo] = useState<string>(initial?.metodo ?? "Efectivo");
  const [concepto, setConcepto] = useState(initial?.concepto ?? "");
  const [monto, setMonto] = useState(initial?.monto ?? 0);
  const [status, setStatus] = useState<Pago["status"]>(initial?.status ?? "approved");

  const statusLabels: Record<Pago["status"], string> = {
    approved: "Aprobado",
    pending: "Pendiente",
    rejected: "Rechazado",
  };

  useEffect(() => {
    if (initial) {
      setPacienteId(String(initial.paciente_id));
      setFecha(initial.fecha);
      setMetodo(initial.metodo);
      setConcepto(initial.concepto);
      setMonto(initial.monto);
      setStatus(initial.status);
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const pac = pacientes.find(p => String(p.id) === pacienteId);

    const payload: any = {
      paciente_id: pacienteId,
      paciente_nombre: pac ? pac.nombre_completo : (initial?.paciente_nombre || ""),
      fecha,
      metodo,
      concepto,
      monto: Number(monto),
      status,
    };

    if (initial?.id) {
      await onSave({ ...payload, id: initial.id });
    } else {
      await onSave(payload);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {initial ? "Editar Registro" : "Nuevo Pago"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4">
            {/* Paciente */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Paciente *
              </label>
              <select
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
              >
                <option value="">Seleccionar paciente...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Monto ($)
                </label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Concepto */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Concepto / Práctica
              </label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Limpieza, Extracción..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Método */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Método
                </label>
                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                >
                  <option>Efectivo</option>
                  <option>Transferencia</option>
                  <option>Mercado Pago</option>
                  <option>Débito</option>
                  <option>Crédito</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Pago["status"])}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                >
                  <option value="approved">Aprobado</option>
                  <option value="pending">Pendiente</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                Guardar
              </button>
            </div>

            {initial && onDelete && (
              <button
                type="button"
                className="w-full py-2 text-rose-500 text-xs font-bold uppercase tracking-widest hover:text-rose-700 transition-colors"
                onClick={() => onDelete(initial.id)}
              >
                Eliminar Registro Permanentemente
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}