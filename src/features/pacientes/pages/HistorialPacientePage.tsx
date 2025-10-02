import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getHistorial, updateHistorial, Historial } from "../services/historial.api"
import { listArchivos, uploadArchivo, deleteArchivo, Archivo } from "../services/archivos.api"
import { getPaciente, Paciente } from "../services/pacientes.api" // 👈 añadimos getPaciente
import OdontogramaGrid from "../odontograma/components/OdontogramGrid"

export default function HistorialPacientePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patientId = Number(id)

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [historial, setHistorial] = useState<Historial>({
    patient_id: patientId,
    antecedentes: "",
    alergias: "",
    notas: "",
  })

  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) {
      console.error("❌ ID de paciente inválido:", id)
      setLoading(false)
      return
    }

    async function load() {
      try {
        console.log("🔄 Cargando historial del paciente:", patientId)

        // 🧑 Traer info del paciente
        const p = await getPaciente(patientId)
        setPaciente(p)

        // 📋 Traer historial
        const data = await getHistorial(patientId)
        if (data) setHistorial(data)

        // 📎 Traer archivos adjuntos
        const files = await listArchivos(patientId)
        setArchivos(files)
      } catch (err) {
        console.error("Error al cargar historial:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [patientId, id])

  async function handleSave() {
    try {
      const saved = await updateHistorial(historial)
      setHistorial(saved)
      alert("Historial guardado ✅")
    } catch (err) {
      console.error("Error al guardar historial:", err)
      alert("Error al guardar historial ❌")
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const newFile = await uploadArchivo(patientId, file)
      setArchivos((prev) => [...prev, newFile])
    } catch (err) {
      console.error("Error al subir archivo:", err)
      alert("Error al subir archivo ❌")
    }
  }

  async function handleDelete(fileId: number) {
    if (!confirm("¿Eliminar este archivo?")) return
    try {
      await deleteArchivo(fileId)
      setArchivos((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      console.error("Error al eliminar archivo:", err)
      alert("Error al eliminar archivo ❌")
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-500">⏳ Cargando historial...</div>
  }

  if (!patientId) {
    return (
      <div className="p-6 text-red-600">
        ❌ El ID de paciente no es válido.  
        <button onClick={() => navigate("/pacientes")} className="underline ml-2">
          Volver a pacientes
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header ancho completo */}
      <header className="bg-gradient-to-r from-sky-600 to-teal-600 text-white p-8 flex flex-col md:flex-row md:items-center md:justify-between shadow">
        <div className="flex items-center gap-4">
          {/* Foto del paciente */}
          {paciente?.foto ? (
            <img
              src={paciente.foto}
              alt={`${paciente.nombre} ${paciente.apellido}`}
              className="w-16 h-16 rounded-full border-2 border-white shadow"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-xl font-bold">
              {paciente ? paciente.nombre[0] : "?"}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold">
              {paciente
                ? `${paciente.nombre} ${paciente.apellido}`
                : `Paciente #${patientId}`}
            </h1>
            <p className="text-sm text-sky-100">
              Administra información clínica, odontograma y archivos adjuntos
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 bg-white/20 px-4 py-1 rounded-full text-sm">
          Última actualización:{" "}
          {historial.updated_at
            ? new Date(historial.updated_at).toLocaleDateString("es-AR")
            : "No disponible"}
        </div>
      </header>

      {/* Resto del contenido igual */}
      <div className="p-6 space-y-8">
        {/* Odontograma */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-emerald-600 mb-3">🦷 Odontograma</h2>
          <div className="overflow-x-auto">
            <OdontogramaGrid patientId={patientId} />
          </div>
        </div>

        {/* Antecedentes */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold text-emerald-600">Antecedentes médicos</h2>
          <textarea
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
            rows={3}
            placeholder="Ej: Hipertensión, diabetes..."
            value={historial.antecedentes || ""}
            onChange={(e) => setHistorial({ ...historial, antecedentes: e.target.value })}
          />
        </div>

        {/* Alergias */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold text-emerald-600">Alergias</h2>
          <textarea
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
            rows={2}
            placeholder="Ej: Penicilina, anestesia..."
            value={historial.alergias || ""}
            onChange={(e) => setHistorial({ ...historial, alergias: e.target.value })}
          />
        </div>

        {/* Notas */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold text-emerald-600">Notas adicionales</h2>
          <textarea
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
            rows={3}
            placeholder="Observaciones generales..."
            value={historial.notas || ""}
            onChange={(e) => setHistorial({ ...historial, notas: e.target.value })}
          />
        </div>

        {/* Archivos adjuntos */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-emerald-600">📎 Archivos adjuntos</h2>
            <label className="px-4 py-2 bg-emerald-600 text-white rounded cursor-pointer hover:bg-emerald-700">
              Subir archivo
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archivos.map((a) => (
              <div key={a.id} className="p-4 bg-gray-50 border rounded shadow-sm flex flex-col">
                <span className="font-medium text-sm">{a.nombre}</span>
                {a.tipo.startsWith("image/") ? (
                  <img src={a.url} alt={a.nombre} className="mt-2 w-full h-32 object-cover rounded" />
                ) : (
                  <div className="mt-2 flex-1 flex items-center justify-center text-gray-500">📄 Documento</div>
                )}
                <button
                  onClick={() => handleDelete(a.id!)}
                  className="mt-3 text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
            {archivos.length === 0 && <p className="text-gray-500 text-sm">No hay archivos adjuntos.</p>}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            💾 Guardar cambios
          </button>
          <button
            onClick={() => navigate("/pacientes")}
            className="border px-5 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            ⬅ Volver a pacientes
          </button>
        </div>
      </div>
    </div>
  )
}
