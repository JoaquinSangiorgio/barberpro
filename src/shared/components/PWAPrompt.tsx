import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Muestra un banner cuando hay una nueva versión del SW disponible.
 * Aparece sobre la bottom nav en mobile, en esquina inferior en desktop.
 * El usuario elige cuándo actualizar — nunca se recarga automáticamente.
 */
export default function PWAPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <div className="bg-[#1d222e] border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3 pointer-events-auto">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-100">Nueva versión disponible</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">Recargá para ver los últimos cambios</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNeedRefresh(false)}
            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors rounded-lg"
          >
            Luego
          </button>
          <button
            onClick={() => void updateServiceWorker(true)}
            className="px-3 py-1.5 text-xs font-black bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl transition-all"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}
