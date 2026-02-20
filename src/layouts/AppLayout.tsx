import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  Menu, X, Users, CalendarDays, DollarSign, LogOut, BarChart4, 
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const items = [
    { to: "/", label: "Dashboard", icon: <BarChart4 size={18} />, end: true },
    { to: "/agenda", label: "Agenda", icon: <CalendarDays size={18} /> },
    { to: "/pacientes", label: "Pacientes", icon: <Users size={18} /> },
    { to: "/pagos", label: "Pagos", icon: <DollarSign size={18} /> },
    { to: "/stock", label: "Stock", icon: <ClipboardList size={18} /> },
  ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-slate-900 text-gray-200 shadow-lg">
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-700">
          <span className="font-bold text-blue-400 text-lg">OdontoFlow</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 relative ${
                  isActive
                    ? "bg-blue-600 text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-400 rounded-l-none"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              {i.icon}
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* SIDEBAR MOBILE */}
      <div
        className={`fixed inset-0 z-50 md:hidden transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setOpen(false)}
        />
        <aside className="relative w-64 h-full bg-slate-900 text-gray-200 flex flex-col shadow-lg">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-700">
            <span className="font-bold text-blue-400 text-lg">OdontoFlow</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                end={i.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                {i.icon}
                {i.label}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 mt-4 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut size={18} /> Cerrar sesión
            </button>
          </nav>
        </aside>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* HEADER MOBILE */}
        <header className="sticky top-0 z-30 h-16 border-b border-gray-700 bg-slate-900 flex items-center px-4 md:hidden text-gray-100">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-300 hover:text-white cursor-pointer"
            aria-expanded={open}
          >
            <Menu size={20} />
          </button>
          <span className="ml-4 font-semibold text-blue-400">OdontoFlow</span>
        </header>

       {/* MAIN */}
<main className="flex-1">
  {/* padding SOLO para el contenido */}
  
    <Outlet />
  
</main>

      </div>
    </div>
  );
}
