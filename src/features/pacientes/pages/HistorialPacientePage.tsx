import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getHistorial, updateHistorial, Historial } from "../services/historial.api"
import { listArchivos, uploadArchivo, deleteArchivo, Archivo } from "../services/archivos.api"
import { getPaciente, Paciente } from "../services/pacientes.api"
import OdontogramaGrid from "../odontograma/components/OdontogramGrid"
import toast, { Toaster } from "react-hot-toast";

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
        const p = await getPaciente(String(patientId))
        setPaciente(p)

        const data = await getHistorial(patientId)
        if (data) setHistorial(data)

        const files = await listArchivos(patientId)
        setArchivos(files)
      } catch (err) {
        console.error("Error al cargar historial:", err)
        toast.error("Error al cargar los datos del paciente");
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [patientId, id])

  // --- ACCIONES CON ALERTAS PERSONALIZADAS ---

  async function handleSave() {
    try {
      const payload = {
        ...historial,
        patient_id: String(patientId), 
        updated_at: new Date().toISOString()
      };
      
      const saved = await updateHistorial(payload);
      setHistorial(saved);
      
      // ✅ Notificación de éxito elegante
      toast.success("Historial clínico guardado correctamente", {
        style: { borderRadius: '12px', background: '#334155', color: '#fff' }
      });
    } catch (err) {
      console.error("Error al guardar historial:", err);
      toast.error("No se pudo guardar el historial ❌");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 🕒 Estado de carga para la subida
    const loadingToast = toast.loading("Subiendo archivo...");

    try {
      const newFile = await uploadArchivo(patientId, file)
      setArchivos((prev) => [...prev, newFile])
      
      // ✅ Actualizamos la misma notificación a éxito
      toast.success("Archivo subido con éxito", { id: loadingToast });
    } catch (err) {
      console.error("Error al subir archivo:", err);
      toast.error("Error al subir el archivo ❌", { id: loadingToast });
    }
  }

  async function handleDelete(fileId: number) {
    // Para eliminaciones, mantenemos el confirm nativo por seguridad, 
    // pero la confirmación final será por Toast.
    if (!confirm("¿Realmente deseas eliminar este archivo?")) return
    
    try {
      await deleteArchivo(fileId)
      setArchivos((prev) => prev.filter((f) => f.id !== fileId))
      toast.success("Archivo eliminado");
    } catch (err) {
      console.error("Error al eliminar archivo:", err)
      toast.error("No se pudo eliminar el archivo");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Cargando historial...</p>
      </div>
    );
  }

  if (!patientId) {
    return <div className="p-6 text-red-600 font-bold">❌ ID de paciente no válido.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ✅ Contenedor global de mensajes */}
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* HEADER */}
      <header className="bg-gradient-to-r from-sky-800 to-emerald-700 text-white p-8 md:p-12 shadow-xl flex flex-wrap gap-6 justify-between items-center">
        <div className="flex items-center gap-6 min-w-[300px] flex-1">
          {paciente?.foto ? (
            <img
              src={paciente.foto}
              alt={`${paciente.nombre}`}
              className="w-20 h-20 rounded-3xl border-4 border-white/20 shadow-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black">
              {paciente ? paciente.nombre[0] : "?"}
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              {paciente ? `${paciente.nombre} ${paciente.apellido}` : `Paciente #${patientId}`}
            </h1>
            <p className="text-emerald-100/70 font-medium text-sm md:text-base">
              Ficha clínica y seguimiento odontológico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-black/10 px-6 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest hidden md:block">
            Sincronizado con Cloud
          </div>
          <button
            onClick={() => navigate("/pacientes")}
            className="bg-white text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-50 transition shadow-lg active:scale-95"
          >
            ⬅ Volver
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="p-6 space-y-10 max-w-7xl mx-auto -mt-6">
        
        {/* ODONTOGRAMA */}
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
          <OdontogramaGrid patientId={patientId} />
        </div>

        {/* ÁREAS DE TEXTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">🩺 Antecedentes</h2>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-medium focus:border-emerald-500 outline-none transition-all"
              rows={4}
              placeholder="Describa antecedentes relevantes..."
              value={historial.antecedentes || ""}
              onChange={(e) => setHistorial({ ...historial, antecedentes: e.target.value })}
            />
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">⚠️ Alergias</h2>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-medium focus:border-rose-300 outline-none transition-all"
              rows={4}
              placeholder="Indique alergias a medicamentos o materiales..."
              value={historial.alergias || ""}
              onChange={(e) => setHistorial({ ...historial, alergias: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 space-y-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">📝 Evolución y Notas</h2>
          <textarea
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-medium focus:border-emerald-500 outline-none transition-all"
            rows={4}
            placeholder="Notas de la última consulta..."
            value={historial.notas || ""}
            onChange={(e) => setHistorial({ ...historial, notas: e.target.value })}
          />
        </div>

        {/* ARCHIVOS ADJUNTOS */}
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">📎 Galería de Archivos</h2>
            <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold cursor-pointer transition-all shadow-lg active:scale-95">
              + Subir Nuevo
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {archivos.map((a) => (
              <div key={a.id} className="group relative bg-slate-50 rounded-3xl p-4 border border-slate-100 hover:shadow-xl transition-all">
                {a.tipo.startsWith("image/") ? (
                  <img src={a.url} alt={a.nombre} className="w-full h-40 object-cover rounded-2xl shadow-sm mb-3" />
                ) : (
                  <div className="w-full h-40 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-3">📄</div>
                )}
                <div className="space-y-1">
                  <p className="font-bold text-slate-700 truncate text-sm px-1">{a.nombre}</p>
                  <button
                    onClick={() => handleDelete(a.id!)}
                    className="w-full py-2 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            ))}
            {archivos.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium italic bg-slate-50 rounded-[2rem] border-2 border-dashed">
                Aún no hay archivos registrados.
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button
            onClick={handleSave}
            className="bg-emerald-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            💾 GUARDAR CAMBIOS
          </button>
        </div>
      </div>
    </div>
  )
}