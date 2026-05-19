"use client"

import { useEffect, useState } from "react"
import type { Paciente, PacienteInput } from "../types"
import { Save, User, Phone, Mail } from "lucide-react"

type Props = {
  initial?: Paciente | null
  onSubmit: (values: PacienteInput) => Promise<void> | void
  onCancel: () => void
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "")
}

export default function PacienteForm({ initial, onSubmit, onCancel }: Props) {
  const isEdit = Boolean(initial?.id)
  const [nombre, setNombre] = useState(initial?.nombre ?? "")
  const [apellido, setApellido] = useState(initial?.apellido ?? "")
  const [telefono, setTelefono] = useState(initial?.telefono ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setNombre(initial?.nombre ?? "")
    setApellido(initial?.apellido ?? "")
   
    
    setTelefono(initial?.telefono ?? "")
    setErrors({})
  }, [initial])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!nombre.trim()) e.nombre = "El nombre es obligatorio."
    if (!apellido.trim()) e.apellido = "El apellido es obligatorio."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    if (!validate()) return;

    // 💡 SOLUCIÓN CRÍTICA: Construimos el payload enviando ÚNICAMENTE lo que tu API soporta
    const payload: PacienteInput = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono ? onlyDigits(telefono) : undefined
    };

    console.log("Enviando cliente", payload);
    await onSubmit(payload);
  }

  // 💈 Clases compartidas adaptadas a la paleta Barber Dark
  const fieldCls = (errorKey: string) => `
    w-full border rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base transition-all outline-none font-bold text-slate-200
    ${errors[errorKey] 
      ? "border-rose-500 bg-rose-950/20 focus:border-rose-500" 
      : "border-slate-800 bg-[#12141a] focus:border-amber-500 focus:bg-[#12141a] placeholder:text-slate-700"}
  `
  const labelCls = "text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest flex items-center gap-1.5"

  return (
    <div className="h-full flex flex-col bg-[#161920] overflow-hidden">
      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 md:px-6 md:py-5">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 md:space-y-5 pb-4">
          
          {/* Fila Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}><User className="w-3.5 h-3.5 text-slate-500"/> Nombre *</label>
              <input className={fieldCls("nombre")} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan" />
              {errors.nombre && <span className="text-[10px] text-rose-400 font-bold ml-1 italic tracking-wide">{errors.nombre}</span>}
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}><User className="w-3.5 h-3.5 text-slate-500"/> Apellido *</label>
              <input className={fieldCls("apellido")} value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Ej: Pérez" />
              {errors.apellido && <span className="text-[10px] text-rose-400 font-bold ml-1 italic tracking-wide">{errors.apellido}</span>}
            </div>
          </div>

          {/* Fila Correo */}
          

          {/* Fila Teléfono y DNI combinados para optimizar espacio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}><Phone className="w-3.5 h-3.5 text-slate-500"/> Teléfono</label>
              <input className={fieldCls("telefono")} inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: 2615551234" />
              {errors.telefono && <span className="text-[10px] text-rose-400 font-bold ml-1 italic tracking-wide">{errors.telefono}</span>}
            </div>
            
          </div>

        </form>
      </div>

      {/* FOOTER FIJO DARK */}
      <div className="px-4 py-4 md:px-6 md:py-5 border-t border-slate-800 bg-[#12141a] flex gap-3 z-10 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-slate-800 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
        >
          Cancelar
        </button>

        <button
          type="submit"
          onClick={handleSubmit}
          className="flex-[2] bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-black shadow-lg shadow-amber-950/30 border border-amber-500/15 active:scale-[0.98] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? "Guardar Cambios" : "Guardar Cliente"}
        </button>
      </div>
    </div>
  )
}