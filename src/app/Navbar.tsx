import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Users,
  CalendarDays,
  DollarSign,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { to: "/agenda", label: "Agenda", icon: <CalendarDays className="h-5 w-5" /> },
    { to: "/pacientes", label: "Clientes", icon: <Users className="h-5 w-5" /> },
    { to: "/pagos", label: "Pagos", icon: <DollarSign className="h-5 w-5" /> },
    { to: "/historial", label: "Historial", icon: <ClipboardList className="h-5 w-5" /> },
    { to: "/stock", label: "Inventario", icon: <ClipboardList className="h-5 w-5" /> },
  ];

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="text-lg font-semibold text-blue-600">
          BarberPRO
        </Link>

        {/* Links Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <button className="ml-4 px-3 py-2 border rounded hover:bg-gray-50">
            Cerrar sesión
          </button>
        </div>

        {/* Botón hamburguesa (solo mobile) */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Menú contraíble en móvil */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 border-t shadow-lg" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col p-4 space-y-4 bg-white">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setOpen(false)} // cierra al hacer click
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center px-3 py-2 border rounded hover:bg-gray-50"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
