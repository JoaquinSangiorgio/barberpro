import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/agenda", label: "Agenda" },
  { to: "/pacientes", label: "Pacientes" },
  { to: "/pagos", label: "Pagos y facturación" },
  { to: "/stock", label: "Stock e insumos" },
  { to: "/reportes", label: "Reportes / BI" },
  { to: "/portal-paciente", label: "Portal paciente" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa (solo mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50">
        <div className="font-semibold text-blue-600">OdontoFlow</div>
        <button onClick={() => setOpen(true)} className="text-gray-700">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r bg-white">
        <div className="p-4 font-semibold text-blue-600">OdontoFlow</div>
        <nav className="flex-1 px-2 space-y-1">
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Sidebar móvil (drawer) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Fondo oscuro */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setOpen(false)}
        ></div>

        {/* Panel lateral */}
        <aside className="relative w-64 h-full bg-white shadow-lg flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold text-blue-600">OdontoFlow</span>
            <button onClick={() => setOpen(false)} className="text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 space-y-1 mt-2">
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                end={i.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                {i.label}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
