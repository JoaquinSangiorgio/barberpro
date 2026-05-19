import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Users, CalendarDays, DollarSign, LogOut, BarChart4, ClipboardList,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import PWAPrompt from "@/shared/components/PWAPrompt";

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const items = [
    { to: "/", label: "Dashboard", icon: <BarChart4 size={22} />, end: true },
    { to: "/agenda", label: "Agenda", icon: <CalendarDays size={22} /> },
    { to: "/pacientes", label: "Clientes", icon: <Users size={22} /> },
    { to: "/pagos", label: "Pagos", icon: <DollarSign size={22} /> },
    { to: "/stock", label: "Stock", icon: <ClipboardList size={22} /> },
  ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-[#0f1115]">

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-slate-900 text-gray-200 shadow-lg">
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-700">
          <span className="font-bold text-amber-400 text-lg tracking-tight uppercase">BarberPRO</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
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
                `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 relative ${
                  isActive
                    ? "bg-amber-600/20 text-amber-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400 before:rounded-r"
                    : "text-gray-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {i.icon}
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 md:pl-64 flex flex-col">

        {/* Header mobile — se expande hacia arriba para cubrir la muesca/notch */}
        <header
          className="sticky top-0 z-30 bg-[#161920] border-b border-slate-800/60 flex flex-col md:hidden"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="h-14 flex items-center justify-between px-5">
            <span className="font-black text-amber-500 text-base tracking-tight uppercase">BarberPRO</span>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
          {/*
            Espaciador mobile: 4rem (altura de la tab bar) + home indicator.
            md:hidden lo elimina en desktop sin conflictos de especificidad.
          */}
          <div
            className="md:hidden"
            style={{ height: 'calc(4rem + env(safe-area-inset-bottom))' }}
            aria-hidden="true"
          />
        </main>
      </div>

      {/* Banner de actualización PWA */}
      <PWAPrompt />

      {/* ── BOTTOM TAB BAR MOBILE ── */}
      {/*
        La nav crece hacia abajo con paddingBottom = home indicator.
        El color de fondo cubre hasta el borde de pantalla (viewport-fit=cover).
        Los tabs viven en la fila interior h-16, siempre por encima del indicador.
      */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#161920] border-t border-slate-800/80"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="h-16 flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="flex-1">
              {({ isActive }) => (
                <div
                  className={`h-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative ${
                    isActive ? "text-amber-400" : "text-slate-500 active:text-slate-300"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-amber-400" />
                  )}
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-amber-500/10" : ""}`}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
