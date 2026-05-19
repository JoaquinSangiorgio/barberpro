import type { Paciente } from "../types";
import { Link } from "react-router-dom";
import { Pencil, Trash2, FileText } from "lucide-react";

type Props = {
  data: Paciente[];
  onEdit: (p: Paciente) => void;
  onDelete: (id: string) => void;
};

export default function PacientesTable({ data, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* 📱 Cards en mobile */}
      <div className="block md:hidden divide-y divide-gray-200">
        {data.length === 0 && (
          <div className="p-4 text-center text-gray-500">Sin pacientes</div>
        )}
        {data.map((p) => (
          <div key={p.id} className="p-4 space-y-2">
            <div className="font-medium">
              {p.apellido}, {p.nombre}
            </div>
            <div className="text-sm text-gray-600">
              <strong>DNI:</strong> {p.dni || "-"}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Email:</strong> {p.email || "-"}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Teléfono:</strong> {p.telefono || "-"}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Alta:</strong>{" "}
              {p.fechaAlta
                ? new Date(p.fechaAlta).toLocaleDateString("es-AR")
                : "-"}
            </div>
            <div className="flex gap-4 pt-2 text-gray-600">
              <button
                onClick={() => onEdit(p)}
                title="Editar"
              >
                <Pencil className="w-5 h-5 text-orange-500 hover:text-orange-600" />
              </button>
              <button
                onClick={() => onDelete(p.id)}
                title="Borrar"
              >
                <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600" />
              </button>
              <Link
                to={`/pacientes/${p.id}/historial`}
                title="Historial"
              >
                <FileText className="w-5 h-5 text-emerald-500 hover:text-emerald-600" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 💻 Tabla en desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-700">
              <th className="px-4 py-2 whitespace-nowrap">Nombre</th>
              <th className="px-4 py-2 whitespace-nowrap">DNI</th>
              <th className="px-4 py-2 whitespace-nowrap">Email</th>
              <th className="px-4 py-2 whitespace-nowrap">Teléfono</th>
              <th className="px-4 py-2 whitespace-nowrap">Alta</th>
              <th className="px-4 py-2 whitespace-nowrap text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Sin pacientes
                </td>
              </tr>
            )}
            {data.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.apellido}, {p.nombre}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{p.dni || "-"}</td>
                <td className="px-4 py-2">{p.email || "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.telefono || "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.fechaAlta
                    ? new Date(p.fechaAlta).toLocaleDateString("es-AR")
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => onEdit(p)} title="Editar">
                      <Pencil className="w-5 h-5 text-orange-100 hover:text-orange-600" />
                      <h2>AA</h2>
                    </button>
                    <button onClick={() => onDelete((p.id))} title="Borrar">
                      <Trash2 className="w-5 h-5 text-red-700 hover:text-red-10000" />
                    </button>
                    <Link to={`/pacientes/${p.id}/historial`} title="Historial">
                      <FileText className="w-5 h-5 text-emerald-500 hover:text-emerald-600"/>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
