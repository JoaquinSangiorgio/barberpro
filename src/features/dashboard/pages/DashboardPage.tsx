"use client";

import { useEffect, useState, useMemo } from "react";
import StatCard from "@/shared/components/StatCard";
import ChartCard from "@/shared/components/ChartCard";
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
} from "recharts";
import { Users, CalendarDays, DollarSign, Clock3, Activity, TrendingUp } from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";

import { listPacientes } from "../../pacientes/services/pacientes.api";
import { getDashboardSummary } from "../pages/services/dashboard.api";
import { listPagos } from "../../pagos/services/payments.api";

// Configuración de colores para los gráficos
const COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const COLORS_MEDIOS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

const STATE_COLORS: Record<string, string> = {
  Pendiente: "#f59e0b",
  Confirmado: "#10b981",
  Completado: "#3b82f6",
  "No asistió": "#64748b",
  Cancelado: "#ef4444",
};

const STATUS_MAP: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  no_show: "No asistió",
  cancelled: "Cancelado",
};

const FIXED_STATES = ["Pendiente", "Confirmado", "Completado", "No asistió", "Cancelado"];

export default function DashboardPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any>({});
  const [pagosData, setPagosData] = useState<any>({
    ingresosMes: 0,
    estadoPagos: [],
    mediosPago: [],
    ingresosPorDia: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [pacRes, dashRes, pagosRaw] = await Promise.all([
          listPacientes(),
          getDashboardSummary(),
          listPagos()
        ]);

        setPacientes(pacRes);
        setAppointments(dashRes);

        // --- PROCESAMIENTO DE PAGOS ---
        const totalIngresos = pagosRaw
          .filter(p => p.status === 'approved')
          .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);

        // 1. Agrupar por Fecha para Tendencia
        const ingresosMap: Record<string, number> = {};
        pagosRaw.filter(p => p.status === 'approved').forEach(p => {
          const fecha = p.fecha.split(' ')[0]; 
          ingresosMap[fecha] = (ingresosMap[fecha] || 0) + Number(p.monto);
        });

        const ingresosPorDia = Object.keys(ingresosMap)
          .map(fecha => ({
            dia: fecha.split('-').reverse().slice(0, 2).join('/'),
            fullFecha: fecha,
            ingresos: ingresosMap[fecha]
          }))
          .sort((a, b) => a.fullFecha.localeCompare(b.fullFecha))
          .slice(-7);

        // 2. Agrupar por Medio de Pago
        const mediosMap: Record<string, number> = {};
        pagosRaw.forEach(p => {
          const m = p.metodo || "Efectivo";
          mediosMap[m] = (mediosMap[m] || 0) + 1;
        });

        const mediosPago = Object.keys(mediosMap).map(name => ({
          name,
          value: mediosMap[name]
        }));

        setPagosData({
          ingresosMes: totalIngresos,
          estadoPagos: [
            { name: "Aprobados", value: pagosRaw.filter(p => p.status === 'approved').length },
            { name: "Pendientes", value: pagosRaw.filter(p => p.status === 'pending').length },
            { name: "Rechazados", value: pagosRaw.filter(p => p.status === 'rejected').length }
          ],
          mediosPago,
          ingresosPorDia
        });

      } catch (err) {
        console.error("Error en Dashboard Firebase:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatPeso = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);

  const todayStr = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const statusSummary = appointments.statusSummary ?? {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER ADAPTADO A PALETA BARBER (SÓLO CAMBIO DE COLOR) */}
      <header className="w-full md:pl-64 bg-[#161920] text-white shadow-xl border-b border-slate-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-red-600 via-white to-blue-600 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-8 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black flex items-center gap-3 tracking-tight text-amber-500 uppercase">
              <Activity className="w-10 h-10 text-amber-500 animate-pulse" /> Resumen General
            </h1>
            <p className="text-slate-400 font-medium">Control financiero y de agenda en tiempo real</p>
          </div>
          <div className="bg-[#1d222e] px-6 py-3 rounded-2xl border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 block">Fecha Actual:</span>
            <span className="text-lg font-black text-amber-400 capitalize">{todayStr}</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO (RESPETANDO EL DISEÑO Y EL FONDO GRIS DETRÁS DE LAS CARDS) */}
      <main className="flex-1 p-8 space-y-10 max-w-7xl mx-auto w-full bg-slate-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400">Sincronizando con Firestore...</p>
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Clientes"
                value={<CountUp end={pacientes.length} />}
                hint="Total base de datos"
                icon={<Users className="h-7 w-7 text-sky-600" />}
              />
              <StatCard
                title="Ingresos Totales"
                value={formatPeso(pagosData.ingresosMes)}
                hint="Pagos aprobados"
                icon={<DollarSign className="h-7 w-7 text-emerald-600" />}
              />
              <StatCard
                title="Turnos pendientes"
                value={<CountUp end={appointments.pendientesTotales ?? 0} />}
                hint="Próximos turnos"
                icon={<Clock3 className="h-7 w-7 text-amber-600" />}
              />
            </section>

            {/* CHARTS SECTION */}
            <section className="grid gap-8 lg:grid-cols-2">
              <ChartCard title="📈 Tendencia de Ingresos Diarios">
                <div className="h-72 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pagosData.ingresosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(v: any) => [formatPeso(v), "Cobrado"]}
                      />
                      <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <div className="grid grid-cols-1 gap-8">
                <ChartCard title="💳 Medios de Pago más usados">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pagosData.mediosPago} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={8}>
                          {pagosData.mediosPago.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS_MEDIOS[i % COLORS_MEDIOS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            </section>

            {/* BOTTOM SECTION */}
            <section className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <ChartCard title="📅 Resumen de Turnos">
                  <div className="space-y-3 mt-4">
                    {FIXED_STATES.map((state) => {
                      const englishKey = Object.keys(STATUS_MAP).find(k => STATUS_MAP[k] === state);
                      const count = englishKey ? statusSummary[englishKey] ?? 0 : 0;
                      return (
                        <div key={state} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATE_COLORS[state] }} />
                            <span className="font-bold text-slate-700">{state}</span>
                          </div>
                          <span className="text-lg font-black text-slate-900">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </ChartCard>
              </div>

              <div className="lg:col-span-2">
                <ChartCard title="🕒 Turnos Próximos (Hoy y Adelante)">
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-4">Fecha</th> 
                          <th className="pb-4">Cliente</th>
                          <th className="pb-4">Estado</th>
                          <th className="pb-4 text-right">Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(appointments.recentAppointments ?? []).map((c: any, i: number) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4">
                              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
                                {c.fecha}
                              </span>
                            </td>
                            <td className="py-4 font-bold text-slate-200">{c.paciente}</td>
                            <td className="py-4">
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{ 
                                backgroundColor: `${STATE_COLORS[STATUS_MAP[c.status] || 'Pendiente']}20`,
                                color: STATE_COLORS[STATUS_MAP[c.status] || 'Pendiente']
                              }}>
                                {STATUS_MAP[c.status] || c.status}
                              </span>
                            </td>
                            <td className="py-4 text-right font-black text-slate-400">{c.hora} hs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!appointments.recentAppointments || appointments.recentAppointments.length === 0) && (
                      <div className="py-12 text-center text-slate-400 font-medium italic">
                        No hay citas próximas registradas.
                      </div>
                    )}
                  </div>
                </ChartCard>
              </div>
            </section>
          </>
        )}
      </main>
    </motion.div>
  );
}