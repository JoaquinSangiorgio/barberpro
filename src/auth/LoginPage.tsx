import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getAuthToken } from "@/lib/auth"; // 👈 doble chequeo con el token

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya está logueado y además HAY token, ir a /dashboard
  useEffect(() => {
    if (isAuthenticated && getAuthToken()) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // IMPORTANTE: que login NO navegue por su cuenta
      await login(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-bg to-bg-soft">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-semibold">Ingresar</h1>

        <div className="space-y-2">
          <label className="text-sm font-medium">Usuario</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu usuario"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contraseña</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña..."
          />
        </div>

        {error && <div className="text-sm text-rose-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white font-medium disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
