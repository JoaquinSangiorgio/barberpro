"use client";

import { useEffect, useState } from "react";
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
  
  // 1. Manejamos el estado como string. Si es 0 o no existe, va vacío "" para activar el placeholder
  const [monto, setMonto] = useState<string>(
    initial?.monto ? String(initial.monto) : ""
  );
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
      // 2. Al editar, convertimos el número a string. Si es 0, lo dejamos vacío
      setMonto(initial.monto ? String(initial.monto) : "");
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
      // 3. Al guardar, lo transformamos a Number de forma segura
      monto: Number(monto) || 0,
      status,
    };

    if (initial?.id) {
      await onSave({ ...payload, id: initial.id });
    } else {
      await onSave(payload);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
      <div className="bg-[#161920] rounded-3xl shadow-2xl w-full max-w-md border border-slate-800/80 overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#12141a]">
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
            {initial ? "Editar Registro" : "Nuevo Pago"}
          </h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4">
            {/* Paciente */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Cliente *
              </label>
              <select
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
              >
                <option value="" className="bg-[#161920]">Seleccionar Cliente...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#161920]">
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
                  className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Monto ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={monto}
                  // 4. Guardamos el valor crudo como string para que no moleste al escribir
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Concepto */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Práctica
              </label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Corte, Tintura..."
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm placeholder:text-slate-700"
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
                  className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
                >
                  <option className="bg-[#161920]">Efectivo</option>
                  <option className="bg-[#161920]">Transferencia</option>
                  <option className="bg-[#161920]">Mercado Pago</option>
                  <option className="bg-[#161920]">Débito</option>
                  <option className="bg-[#161920]">Crédito</option>
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
                  className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
                >
                  <option value="approved" className="bg-[#161920]">Aprobado</option>
                  <option value="pending" className="bg-[#161920]">Pendiente</option>
                  <option value="rejected" className="bg-[#161920]">Rechazado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-800">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all text-sm uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-2xl bg-amber-600 text-white font-bold hover:bg-amber-500 shadow-lg shadow-amber-950/40 border border-amber-500/15 transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                Guardar
              </button>
            </div>

            {initial && onDelete && (
              <button
                type="button"
                className="w-full py-2 text-rose-400 text-xs font-bold uppercase tracking-widest hover:text-rose-300 transition-colors"
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