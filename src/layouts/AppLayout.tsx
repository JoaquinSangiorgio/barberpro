import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { Menu, X, Users, CalendarDays, DollarSign, BarChart3 } from "lucide-react";

export default function AppLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = [
    { to: "/", label: "Dashboard", icon: <BarChart3 className="h-5 w-5" />, end: true },
    { to: "/agenda", label: "Agenda", icon: <CalendarDays className="h-5 w-5" /> },
    { to: "/pacientes", label: "Pacientes", icon: <Users className="h-5 w-5" /> },
    { to: "/pagos", label: "Pagos", icon: <DollarSign className="h-5 w-5" /> },
  ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white flex-col">
        <div className="h-16 px-5 flex items-center justify-between border-b">
          <span className="font-semibold text-lg text-blue-600">OdontoFlow</span>
          <button
            className="h-9 rounded-md border px-3 hover:bg-gray-50"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")
              }
            >
              {i.icon}
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* SIDEBAR MOBILE (DRAWER) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setOpen(false)}
        />
        {/* Drawer */}
        <aside className="relative w-64 h-full bg-white shadow-lg flex flex-col">
          <div className="h-16 px-5 flex items-center justify-between border-b">
            <span className="font-semibold text-lg text-blue-600">OdontoFlow</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-700 hover:text-blue-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                end={i.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")
                }
              >
                {i.icon}
                {i.label}
              </NavLink>
            ))}
            <button
              className="mt-4 w-full h-9 rounded-md border px-3 hover:bg-gray-50"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </nav>
        </aside>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* HEADER MOBILE */}
        <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white flex items-center px-4 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-700 hover:text-blue-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-4 font-semibold text-blue-600">OdontoFlow</span>
        </header>

        {/* MAIN */}
        <main className="">
          <div className="">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
