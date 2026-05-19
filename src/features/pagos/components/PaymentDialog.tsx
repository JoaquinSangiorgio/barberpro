"use client";

import { useEffect, useState } from "react";
import type { Pago, PacienteLite } from "../services/payments.api";
import type { Barbero } from "../services/barberos.api";

const SIN_TURNO_ID = "sin_turno";

type Props = {
  initial?: Pago;
  pacientes: PacienteLite[];
  barberos: Barbero[];
  onSave: (p: Omit<Pago, "id"> | Pago) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
  onPayWithMP?: (pago: Omit<Pago, "id">) => Promise<void>;
};

export default function PaymentDialog({
  initial, pacientes, barberos, onSave, onDelete, onCancel,
}: Props) {
  const [pacienteId, setPacienteId] = useState<string>(
    initial?.paciente_id ? String(initial.paciente_id) : SIN_TURNO_ID,
  );
  const [fecha, setFecha] = useState(initial?.fecha ?? new Date().toISOString().split("T")[0]);
  const [metodo, setMetodo] = useState<string>(initial?.metodo ?? "Efectivo");
  const [concepto, setConcepto] = useState(initial?.concepto ?? "Corte");
  const [monto, setMonto] = useState<string>(initial?.monto ? String(initial.monto) : "");
  const [status, setStatus] = useState<Pago["status"]>(initial?.status ?? "approved");
  const [barbero, setBarbero] = useState<string>(initial?.barbero ?? "");

  
//bloqueo de scroll de pagina al abrir dialog
useEffect(() => {
  const originalStyle = window.getComputedStyle(document.body).overflow;
  
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalStyle;
  };
}, []);


  useEffect(() => {
    if (initial) {
      setPacienteId(String(initial.paciente_id));
      setFecha(initial.fecha);
      setMetodo(initial.metodo);
      setConcepto(initial.concepto);
      setMonto(initial.monto ? String(initial.monto) : "");
      setStatus(initial.status);
      setBarbero(initial.barbero ?? "");
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const esSinTurno = pacienteId === SIN_TURNO_ID;
    const pac = pacientes.find((p) => String(p.id) === pacienteId);

    const payload: any = {
      paciente_id: pacienteId,
      paciente_nombre: esSinTurno
        ? "Cliente sin turno"
        : (pac?.nombre_completo ?? initial?.paciente_nombre ?? ""),
      fecha,
      metodo,
      concepto,
      monto: Number(monto) || 0,
      status,
      barbero: barbero.trim() || undefined,
    };

    if (initial?.id) {
      await onSave({ ...payload, id: initial.id });
    } else {
      await onSave(payload);
    }
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-0 sm:p-4">
      <div className="bg-[#161920] w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-800/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 relative max-h-[calc(100dvh-76px)] mb-[76px] sm:mb-0 flex flex-col">
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* Barra de arrastre mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#12141a] shrink-0">
          <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
            {initial ? "Editar Registro" : "Nuevo Pago"}
          </h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Barbero — campo principal del flujo de barbería */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Barbero *
            </label>
            {barberos.length > 0 ? (
              <select
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
              >
                <option value="" className="bg-[#161920]">Seleccionar barbero...</option>
                {barberos.map((b) => (
                  <option key={b.id} value={b.nombre} className="bg-[#161920]">
                    {b.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={barbero}
                onChange={(e) => setBarbero(e.target.value)}
                placeholder="Nombre del barbero..."
                required
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm placeholder:text-slate-700"
              />
            )}
            {barberos.length === 0 && (
              <p className="text-[10px] text-slate-600 mt-1 ml-1">
                Agregá barberos desde el Cierre de Caja para usar un selector
              </p>
            )}
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Cliente
            </label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
            >
              {/* Opción por defecto siempre presente */}
              <option value={SIN_TURNO_ID} className="bg-[#161920]">
                Cliente sin turno
              </option>
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
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                required
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Concepto
            </label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej: Corte, Barba, Tintura..."
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

          {/* Acciones */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
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
