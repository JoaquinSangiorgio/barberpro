import { ReactNode } from "react";

export default function StatCard({
  title, value, hint, icon
}: { title: string; value: string | ReactNode; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-[#1a1e26] to-[#12141a] border border-slate-800/60 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:translate-y-[-4px] hover:border-amber-500/30 hover:shadow-[0_10px_30px_rgba(217,119,6,0.1)]">
      
      {/* 💈 DETALLE VISUAL INTERNO: Luz de fondo que reacciona al hover */}
      <div className="absolute -right-10 -top-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl transition-all duration-300 group-hover:bg-amber-500/10 group-hover:scale-150" />
      
      <div className="flex items-center justify-between relative z-10">
        {/* Título en mayúsculas sutiles, más espaciado y nítido */}
        <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-400 transition-colors duration-300">
          {title}
        </div>
        
        {/* Contenedor del Icono con un círculo de fondo estilizado */}
        {icon && (
          <div className="p-2 bg-slate-800/40 border border-slate-700/30 rounded-xl text-slate-300 transition-all duration-300 group-hover:scale-110 group-hover:border-amber-500/20 group-hover:text-amber-500 group-hover:bg-amber-950/20">
            {icon}
          </div>
        )}
      </div>
      
      {/* Valor principal: Más grande, pesado y con un leve tono oro/blanco */}
      <div className="mt-4 text-3xl font-black text-white tracking-tight font-sans relative z-10">
        {value}
      </div>
      
      {/* Hint inferior: Limpio, con una pequeña barra decorativa de progreso decorativa si quisieras */}
      {hint && (
        <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between relative z-10">
          <span className="text-xs text-slate-500 font-medium tracking-wide">
            {hint}
          </span>
          {/* Un mini detalle estético tipo barra urbana */}
          <div className="w-8 h-[2px] bg-slate-800 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-amber-500/50 group-hover:w-full transition-all duration-500" />
          </div>
        </div>
      )}
    </div>
  );
}