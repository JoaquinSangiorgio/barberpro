import { logout } from "@/lib/auth"
import { useNavigate } from "react-router-dom"

type Props = {
  className?: string
  after?: string      // adónde redirigir luego de cerrar sesión
  confirm?: boolean   // pedir confirmación nativa (opcional)
}

export default function LogoutButton({
  className = "",
  after = "/login",
  confirm = false,
}: Props) {
  const navigate = useNavigate()

  function handleClick() {
    if (confirm && !window.confirm("¿Cerrar sesión?")) return
    logout()
    navigate(after, { replace: true })
  }

  return (
    <button
      onClick={handleClick}
      title="Cerrar sesión"
      className={`h-9 px-4 rounded-md border text-sm font-medium hover:bg-slate-50 transition ${className}`}
    >
      🚪 Cerrar sesión
    </button>
  )
}
