import { useEffect, useMemo, useState } from "react"
import type { Paciente, PacienteInput } from "../types"


const OBRAS = [
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Sancor",
  "PAMI",
  "IOMA",
  "Medife",
  "Omint",
  "Otra",
] as const

type Props = {
  initial?: Paciente | null
  onSubmit: (values: PacienteInput) => Promise<void> | void
  onCancel: () => void
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "")
}
function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export default function PacienteForm({ initial, onSubmit, onCancel }: Props) {
  const isEdit = Boolean(initial?.id)

  const [nombre, setNombre] = useState(initial?.nombre ?? "")
  const [apellido, setApellido] = useState(initial?.apellido ?? "")
  const [dni, setDni] = useState(initial?.dni ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  const [telefono, setTelefono] = useState(initial?.telefono ?? "")
  const [fechaNacimiento, setFechaNacimiento] = useState(initial?.fechaNacimiento ?? "")
  const [obraSocial, setObraSocial] = useState<string>(initial?.obraSocial ?? "")
  const [numeroAfiliado, setNumeroAfiliado] = useState(initial?.numeroAfiliado ?? "")
  const [notas, setNotas] = useState(initial?.notas ?? "")

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // cuando cambia initial (editar/limpiar), popular el form
    setNombre(initial?.nombre ?? "")
    setApellido(initial?.apellido ?? "")
    setDni(initial?.dni ?? "")
    setEmail(initial?.email ?? "")
    setTelefono(initial?.telefono ?? "")
    setFechaNacimiento(initial?.fechaNacimiento ?? "")
    setObraSocial(initial?.obraSocial ?? "")
    setNumeroAfiliado(initial?.numeroAfiliado ?? "")
    setNotas(initial?.notas ?? "")
    setErrors({})
  }, [initial])

  const title = useMemo(() => (isEdit ? "" : ""), [isEdit])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!nombre.trim()) e.nombre = "El nombre es obligatorio."
    if (!apellido.trim()) e.apellido = "El apellido es obligatorio."
    if (!dni.trim()) e.dni = "El DNI es obligatorio."
    else if (onlyDigits(dni).length < 7) e.dni = "DNI inválido (mínimo 7 dígitos)."
    if (!email.trim()) e.email = "El email es obligatorio."
    else if (email && !isEmail(email.trim().toLowerCase())) e.email = "Email inválido."
    if (!telefono.trim()) e.telefono = "El teléfono es obligatorio."
    else if (telefono && onlyDigits(telefono).length < 6) e.telefono = "Teléfono inválido."
    if (!fechaNacimiento.trim()) e.fechaNacimiento = "La fecha de nacimiento es obligatoria."
    else if (fechaNacimiento && isNaN(+new Date(fechaNacimiento))) e.fechaNacimiento = "Fecha inválida."
    if (obraSocial && obraSocial !== "Otra" && !OBRAS.includes(obraSocial as any)) e.obraSocial = "Obra social desconocida."
    if (obraSocial && obraSocial !== "" && !numeroAfiliado.trim()) e.numeroAfiliado = "N° de afiliado requerido."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: PacienteInput = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni ? onlyDigits(dni) : undefined,
      email: email ? email.trim().toLowerCase() : "",
      telefono: telefono ? onlyDigits(telefono) : undefined,
      fechaNacimiento: fechaNacimiento || undefined,
      obraSocial: obraSocial || undefined,
      numeroAfiliado: numeroAfiliado || undefined,
      notas: notas || undefined,
    }
    await onSubmit(payload)
  }

  const fieldCls =
    "border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
  const lblCls = "text-sm font-medium text-slate-600"

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Título */}
      <h2 className="text-xl font-bold text-emerald-600 mb-2">{title}</h2>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className={lblCls}>Nombre *</span>
          <input className={fieldCls} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errors.nombre && <span className="text-xs text-rose-600">{errors.nombre}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className={lblCls}>Apellido *</span>
          <input className={fieldCls} value={apellido} onChange={(e) => setApellido(e.target.value)} />
          {errors.apellido && <span className="text-xs text-rose-600">{errors.apellido}</span>}
        </label>
      </div>

      {/* DNI / Email / Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className={lblCls}>DNI *</span>
          <input
            className={fieldCls}
            inputMode="numeric"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Solo números"
          />
          {errors.dni && <span className="text-xs text-rose-600">{errors.dni}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className={lblCls}>Email *</span>
          <input
            className={fieldCls}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@mail.com"
          />
          {errors.email && <span className="text-xs text-rose-600">{errors.email}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className={lblCls}>Teléfono *</span>
          <input
            className={fieldCls}
            inputMode="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Cod. área + número"
          />
          {errors.telefono && <span className="text-xs text-rose-600">{errors.telefono}</span>}
        </label>
      </div>

      {/* Fecha / Obra social / Afiliado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className={lblCls}>Fecha de nacimiento *</span>
          <input
            className={fieldCls}
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
          {errors.fechaNacimiento && <span className="text-xs text-rose-600">{errors.fechaNacimiento}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className={lblCls}>Obra social</span>
          <select className={fieldCls} value={obraSocial} onChange={(e) => setObraSocial(e.target.value)}>
            <option value="">—</option>
            {OBRAS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            <option value="Otra">Otra</option>
          </select>
          {errors.obraSocial && <span className="text-xs text-rose-600">{errors.obraSocial}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className={lblCls}>N° de afiliado</span>
          <input className={fieldCls} value={numeroAfiliado} onChange={(e) => setNumeroAfiliado(e.target.value)} />
          {errors.numeroAfiliado && <span className="text-xs text-rose-600">{errors.numeroAfiliado}</span>}
        </label>
      </div>

      {/* Notas */}
      <label className="flex flex-col gap-1">
        <span className={lblCls}>Notas</span>
        <textarea
          className={`${fieldCls} min-h-[80px]`}
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </label>

      {/* Botones */}
      <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition text-sm"
          onClick={onCancel}
        >
          {isEdit ? "Cancelar edición" : "Cancelar"}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
        >
          {isEdit ? "Guardar" : "Crear paciente"}
        </button>
      </div>
    </form>
  )
}
