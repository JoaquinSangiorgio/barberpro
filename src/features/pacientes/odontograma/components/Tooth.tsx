import React from "react";

// Definimos las caras del diente
export type ToothFace = "top" | "bottom" | "left" | "right" | "center";

type ToothCondition =
  | "normal"
  | "caries"
  | "restauracion"
  | "ausente"
  | "corona"
  | "endodoncia"
  | "implante";

interface Props {
  number: number;
  
  faces: Record<ToothFace, ToothCondition>;
  onFaceClick: (number: number, face: ToothFace) => void;
}

export default function Tooth({ number, faces, onFaceClick }: Props) {
  
  // Función para obtener el color de cada polígono según la condición
  const getColor = (condition: ToothCondition) => {
    switch (condition) {
      case "caries": return "#ef4444";       // Rojo
      case "restauracion": return "#f97316"; // Naranja
      case "corona": return "#a855f7";       // Púrpura
      case "endodoncia": return "#22c55e";   // Verde
      case "implante": return "#14b8a6";     // Teal
      case "ausente": return "#94a3b8";      // Gris
      default: return "#ffffff";             // Blanco
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] sm:text-xs font-black text-slate-500 mb-1">
        {number}
      </div>
      
      <div className="relative w-12 h-12 md:w-16 md:h-16">
        {/* Si el diente está ausente, mostramos una X grande encima */}
        {Object.values(faces).includes("ausente") && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-slate-600 text-4xl font-black opacity-40">X</span>
          </div>
        )}

        <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-sm">
          {/* Cara Superior (Vestibular/Palatina) */}
          <polygon 
            points="10,10 70,10 55,25 25,25" 
            fill={getColor(faces?.top || "normal")} 
            stroke="#334155" strokeWidth="1"
            className="cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onFaceClick(number, "top")}
          />
          {/* Cara Inferior (Lingual) */}
          <polygon 
            points="10,70 70,70 55,55 25,55" 
            fill={getColor(faces?.bottom || "normal")} 
            stroke="#334155" strokeWidth="1"
            className="cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onFaceClick(number, "bottom")}
          />
          {/* Cara Izquierda */}
          <polygon 
            points="10,10 25,25 25,55 10,70" 
            fill={getColor(faces?.left || "normal")} 
            stroke="#334155" strokeWidth="1"
            className="cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onFaceClick(number, "left")}
          />
          {/* Cara Derecha */}
          <polygon 
            points="70,10 55,25 55,55 70,70" 
            fill={getColor(faces?.right || "normal")} 
            stroke="#334155" strokeWidth="1"
            className="cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onFaceClick(number, "right")}
          />
          {/* Centro (Oclusal) */}
          <rect 
            x="25" y="25" width="30" height="30" 
            fill={getColor(faces?.center || "normal")} 
            stroke="#334155" strokeWidth="1"
            className="cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onFaceClick(number, "center")}
          />
        </svg>
      </div>
    </div>
  );
}