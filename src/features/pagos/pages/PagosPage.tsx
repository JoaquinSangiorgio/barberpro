"use client";

import { useEffect, useState, useMemo } from "react";
import type { Pago } from "../services/payments.api";
import {
  listPagos,
  createPago,
  updatePago,
  deletePago,
  listPacientes,
  createMPPreference,
  type PacienteLite,
} from "../services/payments.api";
import PaymentDialog from "../components/PaymentDialog";
import CountUp from "react-countup";
import toast, { Toaster } from "react-hot-toast";

export default function PagosPage() {
  const [data, setData] = useState<Pago[]>([]);
  const [editing, setEditing] = useState<Pago | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [patientsLite, setPatientsLite] = useState<PacienteLite[]>([]);
  const [q, setQ] = useState("");

  const statusLabels: Record<Pago["status"], string> = {
    approved: "Aprobado",
    pending: "Pendiente",
    rejected: "Rechazado",
  };

  const statusColors: Record<Pago["status"], string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };

  async function loadPatients() {
    try {
      const pacientes = await listPacientes();
      setPatientsLite(pacientes);
    } catch (e) {
      toast.error("Error cargando pacientes ❌");
    }
  }

  async function refresh() {
    try {
      const pagos = await listPagos();
      setData(pagos);
    } catch (e) {
      toast.error("Error cargando pagos ❌");
    }
  }

  useEffect(() => {
    void refresh();
    void loadPatients();
  }, []);

  async function handleSave(p: Omit<Pago, "id"> | Pago) {
    try {
      if ("id" in p) {
        await updatePago(p);
        toast.success("Pago actualizado ✅");
      } else {
        await createPago(p);
        toast.success("Pago registrado ✅");
      }
      await refresh();
      setOpen(false);
      setEditing(undefined);
    } catch {
      toast.error("Error guardando pago ❌");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar pago?")) return;
    try {
      await deletePago(id);
      toast.success("Pago eliminado 🗑️");
      await refresh();
    } catch {
      toast.error("Error eliminando pago ❌");
    }
  }

  async function handlePayWithMP(p: Omit<Pago, "id">) {
    try {
      const pref = await createMPPreference({
        paciente_id: p.paciente_id,
        concepto: p.concepto,
        monto: Number(p.monto),
        cantidad: 1,
      });
      window.location.href = pref.init_point;
    } catch {
      toast.error("Error iniciando pago con Mercado Pago ❌");
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((p) =>
      [
        p.paciente_nombre,
        p.metodo,
        p.concepto,
        p.fecha,
        statusLabels[p.status],
      ]
        .map((v) => (v ?? "").toLowerCase())
        .some((v) => v.includes(s))
    );
  }, [data, q]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toasts */}
      <Toaster position="top-right" />

      {/* Header */}
      <header className="col-span-full bg-gradient-to-r from-sky-600 to-teal-600 text-white p-6 shadow w-full">
        <div className="px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              💳 Gestión de Pagos
            </h1>
            <p className="text-indigo-100 mt-1">
              Controla todos los pagos registrados en el sistema
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center sm:text-right">
              <div className="text-3xl font-extrabold">
                <CountUp end={data.length} duration={1} />
              </div>
              <div className="text-indigo-100 text-sm">Pagos totales</div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Buscar pagos..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 text-slate-700"
              />
              <button
                className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-200 shadow-md"
                onClick={() => {
                  setEditing(undefined);
                  setOpen(true);
                }}
              >
                + Nuevo Pago
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabla */}
      <main className="p-6">
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Paciente</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No hay pagos registrados.
                  </td>
                </tr>
              )}
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } border-t`}
                >
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3">
                    {p.paciente_nombre || `ID: ${p.paciente_id}`}
                  </td>
                  <td className="px-4 py-3">{p.fecha}</td>
                  <td className="px-4 py-3">{p.metodo}</td>
                  <td className="px-4 py-3">{p.concepto}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${p.monto.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        statusColors[p.status]
                      }`}
                    >
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-3">
                    <button
                      className="text-sky-600 hover:underline"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(p.id)}
                    >
                      Borrar
                    </button>
                    {p.metodo === "Mercado Pago" && p.status === "pending" && (
                      <button
                        className="text-emerald-600 hover:underline"
                        onClick={() =>
                          handlePayWithMP({
                            paciente_id: p.paciente_id,
                            concepto: p.concepto,
                            monto: p.monto,
                            fecha: p.fecha,
                            metodo: p.metodo,
                            status: p.status,
                          })
                        }
                      >
                        Pagar con MP
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {open && (
        <PaymentDialog
          initial={editing}
          pacientes={patientsLite}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
          onCancel={() => {
            setOpen(false);
            setEditing(undefined);
          }}
          onPayWithMP={handlePayWithMP}
        />
      )}
    </div>
  );
}
