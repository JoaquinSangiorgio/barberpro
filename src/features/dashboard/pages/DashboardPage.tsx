"use client"

import { useEffect, useState } from "react"
import StatCard from "@/shared/components/StatCard"
import ChartCard from "@/shared/components/ChartCard"
import {
  CartesianGrid,
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
} from "recharts"
import { Users, CalendarDays, DollarSign, Clock3, Activity } from "lucide-react"
import CountUp from "react-countup"

// Paletas de colores
const COLORS = ["#10b981", "#f59e0b", "#ef4444"]
const COLORS_MP = ["#34d399", "#ce60fa", "#288cdf", "#f97316", "#8b5cf6", "#06b6d4"]

// Colores por estado de citas
const STATE_COLORS: Record<string, string> = {
  Pendiente: "#f59e0b",
  Confirmado: "#10b981",
  "En consulta": "#3b82f6",
  Completado: "#8b5cf6",
  "No asistió": "#ef4444",
  Cancelado: "#6b7280",
}

const FIXED_STATES = ["Pendiente", "Confirmado", "En consulta", "Completado", "No asistió", "Cancelado"]

export default function DashboardPage() {
  const [pacientes, setPacientes] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any>({})
  const [pagos, setPagos] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [pacRes, apptRes, payRes] = await Promise.all([
          fetch("https://sparkx.com.ar/api/patients.php").then((r) => r.json()),
          fetch("https://sparkx.com.ar/api/appointments.php?action=summary").then((r) => r.json()),
          fetch("https://sparkx.com.ar/api/payments.php?action=summary").then((r) => r.json()),
        ])
        setPacientes(pacRes)
        setAppointments(apptRes)
        setPagos(payRes)
      } catch (err) {
        console.error("Error cargando dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Formato moneda
  const formatPeso = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount)

  // Lógica para citas
  const getCitasDisplayData = () => {
    if (appointments.citasHoy > 0) {
      return { title: "Citas Hoy", value: appointments.citasHoy, hint: `${appointments.pendientesHoy ?? 0} pendientes` }
    } else if (appointments.citasUltimaFecha > 0) {
      return {
        title: "Última Fecha con Citas",
        value: appointments.citasUltimaFecha,
        hint: appointments.fechaMostrada ? `Fecha: ${appointments.fechaMostrada}` : "Fecha reciente",
      }
    } else {
      return { title: "Citas Hoy", value: 0, hint: "Sin citas programadas" }
    }
  }

  const citasDisplay = getCitasDisplayData()
  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })

  return (
    <div className="min-h-screen bg-gray-50 space-y-10">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-sky-600 to-teal-600 text-white px-9 py-10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8" /> Dashboard General
            </h1>
            <p className="text-emerald-100 mt-2">Resumen en tiempo real de pacientes, citas y pagos</p>
          </div>
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">{today}</span>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 py-20">⏳ Cargando estadísticas...</div>
      ) : (
        <>
          {/* Top stats */}
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Pacientes"
              value={<CountUp end={pacientes.length} duration={2} />}
              hint="Registrados en el sistema"
              icon={<Users className="h-6 w-6" />}
            />

            <StatCard
              title={citasDisplay.title}
              value={<CountUp end={citasDisplay.value} duration={1} />}
              hint={citasDisplay.hint}
              icon={<CalendarDays className="h-6 w-6" />}
            />

            <StatCard
              title="Ingresos del Mes"
              value={formatPeso(pagos.ingresosMes ?? 0)}
              hint="Pagos aprobados"
              icon={<DollarSign className="h-6 w-6" />}
            />

            <StatCard
              title="Pendientes Totales"
              value={<CountUp end={appointments.pendientesTotales ?? 0} duration={1} />}
              hint={appointments.pendientesTotales > 0 ? "En el sistema" : "Sin pendientes"}
              icon={<Clock3 className="h-6 w-6" />}
            />
          </section>

          {/* Middle charts */}
          <section className="grid gap-6 lg:grid-cols-3">
            {/* Ingresos por Día */}
            <ChartCard title="📈 Ingresos por Día">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pagos.ingresosPorDia ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip formatter={(v: any) => [formatPeso(v), "Ingresos"]} />
                    <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Estado de Pagos */}
            <ChartCard title="💳 Estado de Pagos">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pagos.estadoPagos ?? []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                    {(pagos.estadoPagos ?? []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Medios de Pago */}
            <ChartCard title="🏦 Medios de Pago">
              <div className="space-y-2">
                {(pagos.mediosPago ?? []).length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Sin datos disponibles</p>
                ) : (
                  (pagos.mediosPago ?? []).map((mp: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_MP[i % COLORS_MP.length] }} />
                        <span className="font-medium text-sm">{mp.name}</span>
                      </div>
                      <span className="font-semibold text-gray-600">{mp.value}%</span>
                    </div>
                  ))
                )}
              </div>
            </ChartCard>
          </section>

          {/* Bottom charts */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Estados de Citas */}
            <ChartCard title="📅 Estados de Citas">
              <ul className="space-y-2">
                {FIXED_STATES.map((state) => {
                  const item = (appointments.cancelaciones ?? []).find((c: any) => c.name === state) ?? { name: state, value: 0 }
                  return (
                    <li key={state} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: STATE_COLORS[state] ?? "#6b7280" }} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-700">{item.value}</span>
                    </li>
                  )
                })}
              </ul>
            </ChartCard>

            {/* Citas Recientes */}
            <ChartCard title="🕒 Citas Recientes">
              <ul className="divide-y divide-gray-200">
                {(appointments.proximas ?? []).length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Sin citas recientes</p>
                ) : (
                  (appointments.proximas ?? []).map((c: any, i: number) => (
                    <li key={i} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium">{c.paciente}</div>
                        <div className="text-gray-500">{c.practica} • {c.status}</div>
                      </div>
                      <span className="text-gray-400">{c.hora}</span>
                    </li>
                  ))
                )}
              </ul>
            </ChartCard>
          </section>
        </>
      )}
    </div>
  )
}
