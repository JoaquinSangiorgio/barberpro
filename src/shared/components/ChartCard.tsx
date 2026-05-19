import { ReactNode } from "react";

export default function ChartCard({
  title, right, children
}: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="group relative p-6 bg-gradient-to-b from-[#181b24] to-[#111319] border border-slate-800/80 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.4)] h-full transition-all duration-300 hover:border-slate-700/60 hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      
      {/* 💈 DETALLE ESTÉTICO: Línea superior con gradiente tipo poste de barbero (atenuado en modo premium) */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-50 group-hover:via-amber-500 group-hover:opacity-100 transition-all duration-500" />

      {/* HEADER DE LA CARD */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="space-y-1">
          {/* Título urbano, con un espaciado más agresivo y color oro-viejo */}
          <h2 className="text-xs md:text-sm font-black text-slate-300 tracking-widest uppercase group-hover:text-white transition-colors duration-300">
            {title}
          </h2>
          {/* Mini línea decorativa abajo del título */}
          <div className="w-6 h-[2px] bg-amber-500/30 rounded-full group-hover:w-10 group-hover:bg-amber-500 transition-all duration-300" />
        </div>

        {/* Sección derecha (filtros, fechas, botones) */}
        {right && (
          <div className="text-slate-400 text-xs bg-[#12141a]/80 border border-slate-800 px-3 py-1.5 rounded-xl group-hover:border-slate-700/60 transition-colors">
            {right}
          </div>
        )}
      </div>

      {/* CONTENEDOR DEL GRÁFICO O TABLA */}
      <div className="relative z-10 w-full h-[calc(100%-3rem)]">
        {children}
      </div>
    </div>
  );
}