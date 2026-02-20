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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-sky-100/50 blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-teal-50/50 blur-3xl"></div>
      </div>

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Odonto<span className="text-sky-600">Flow</span>
          </h1>
          <p className="text-sm text-slate-500">Bienvenido de nuevo, ingresa tus credenciales</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email" 
              className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-700 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-700 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-slate-900 px-4 py-3.5 text-white font-semibold shadow-lg transition-all hover:bg-sky-700 hover:shadow-sky-200 active:scale-[0.98] disabled:opacity-70"
        >
          <span className="relative z-10">
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </span>
        </button>

        <div className="flex flex-col items-center space-y-4 pt-2">
          <div className="h-px w-16 bg-slate-200"></div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
            © {new Date().getFullYear()} OdontoFlow System
          </p>
        </div>
      </form>
    </div>
  );
}