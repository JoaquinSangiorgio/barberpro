"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError("Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115] p-4 font-sans relative selection:bg-amber-600 selection:text-white">
      {/* HAZ DE LUZ BARBER SHOP SUTIL DE FONDO */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-800/10 blur-3xl"></div>
      </div>

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl bg-[#161920] p-10 shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-slate-800/80 space-y-8"
      >
        {/* Poste decorativo superior sutil */}
        <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="text-center space-y-2">
          {/* Logo actualizado al branding oro viejo / bronce */}
          <h1 className="text-3xl font-black tracking-widest text-slate-100 uppercase">
            Barber<span className="text-amber-500">PRO</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">Bienvenido de nuevo, ingresá tus credenciales</p>
        </div>

        <div className="space-y-5">
          {/* Campo Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email" 
              className="w-full rounded-xl border border-slate-800 bg-[#12141a] px-4 py-3 text-slate-200 font-bold transition-all placeholder:text-slate-700 focus:outline-none focus:border-amber-500 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              autoFocus
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-800 bg-[#12141a] px-4 py-3 text-slate-200 font-bold transition-all placeholder:text-slate-700 focus:outline-none focus:border-amber-500 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Alerta de Error adaptada al Dark Mode */}
        {error && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-950/20 border border-rose-900/30 p-3 text-sm font-bold text-rose-400 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            {error}
          </div>
        )}

        {/* Botón de envío en Bronce Neto */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-amber-600 px-4 py-3.5 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-amber-950/40 transition-all hover:bg-amber-500 active:scale-[0.98] disabled:opacity-70 border border-amber-500/15"
        >
          <span className="relative z-10">
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </span>
        </button>

        <div className="flex flex-col items-center space-y-4 pt-2">
          <div className="h-px w-12 bg-slate-800"></div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
            © {new Date().getFullYear()} BarberPRO System
          </p>
        </div>
      </form>
    </div>
  );
}