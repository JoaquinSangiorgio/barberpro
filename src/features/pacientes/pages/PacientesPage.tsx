"use client"

import { useEffect, useMemo, useState } from "react"
import type { Paciente, PacienteInput } from "../types"
import { listPacientes, createPaciente, updatePaciente, deletePaciente } from "../services/pacientes.api"
import PacienteForm from "../components/PacienteForm"
import { useNavigate } from "react-router-dom"
import toast, { Toaster } from "react-hot-toast"
import CountUp from "react-countup"

function onlyDigits(s?: string) {
  return (s ?? "").replace(/\D/g, "")
}
function normEmail(s?: string) {
  return (s ?? "").trim().toLowerCase()
}

export default function PacientesPage() {
  const [data, setData] = useState<Paciente[]>([])
  const [editing, setEditing] = useState<Paciente | null>(null)
  const [q, setQ] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return data
    return data.filter((p) =>
      [p.nombre, p.apellido, p.dni, p.email, p.telefono]
        .map((v) => (v ?? "").toLowerCase())
        .some((v) => v.includes(s))
    )
  }, [data, q])

  async function refresh() {
    setErr(null)
    setLoading(true)
    try {
      setData(await listPacientes())
    } catch (e: any) {
      setErr(e?.message ?? "Error al cargar pacientes")
      toast.error("Error al cargar pacientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function handleSubmit(values: PacienteInput) {
    const input: PacienteInput = {
      ...values,
      dni: values.dni ? onlyDigits(values.dni) : undefined,
      email: values.email ? normEmail(values.email) : "",
      telefono: values.telefono ? onlyDigits(values.telefono) : undefined,
    }

    try {
      if (editing) {
        await updatePaciente(editing.id, { ...input })
        toast.success("Paciente actualizado ✅")
      } else {
        await createPaciente(input)
        toast.success("Paciente creado ✅")
      }
      setEditing(null)
      setShowModal(false)
      await refresh()
    } catch {
      toast.error("Error al guardar paciente ❌")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar paciente?")) return
    try {
      await deletePaciente(id)
      toast.success("Paciente eliminado 🗑️")
      await refresh()
    } catch {
      toast.error("Error al eliminar paciente ❌")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toasts */}
      <Toaster position="top-right" />

      {/* Header */}
      <header className="w-full bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow">
        <div className="px-10 py-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">Gestión de Pacientes</h1>
              <p className="text-emerald-100 mt-1">Sistema de administración médica</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-2xl font-bold">
                <CountUp end={data.length} duration={1} />
              </div>
              <div className="text-emerald-100 text-sm">Pacientes registrados</div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-200 flex items-center space-x-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nuevo Paciente</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="p-6 space-y-6">
        {err && <div className="text-sm text-red-600">⚠ {err}</div>}
        {loading && <div className="text-sm text-slate-500">Cargando…</div>}

        <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-emerald-700">Listado de Pacientes</h2>
            <input
              placeholder="Buscar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
            />
          </div>

          <table className="w-full border-collapse">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Apellido</th>
                <th className="px-4 py-2 text-left">DNI</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p.nombre}</td>
                  <td className="px-4 py-2">{p.apellido}</td>
                  <td className="px-4 py-2">{p.dni}</td>
                  <td className="px-4 py-2">{p.telefono}</td>
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(p)
                        setShowModal(true)
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => navigate(`/pacientes/${p.id}/historial`)} // ✅ CORREGIDO
                      className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm"
                    >
                      📜 Historial
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No hay pacientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-emerald-700">
              {editing ? "Editar Paciente" : "Nuevo Paciente"}
            </h2>
            <PacienteForm
              initial={editing}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditing(null)
                setShowModal(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
