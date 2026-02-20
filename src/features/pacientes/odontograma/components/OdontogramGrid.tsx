import React, { useState, useEffect } from "react";
import { getOdontograma, updateTooth } from "../services/odontograma.api";
import Tooth, { ToothFace } from "./Tooth";


type ToothCondition =
  | "normal"
  | "caries"
  | "restauracion"
  | "ausente"
  | "corona"
  | "endodoncia"
  | "implante";

type Props = {
  patientId: number;
};

export default function OdontogramaGrid({ patientId }: Props) {
  const [selectedCondition, setSelectedCondition] = useState<ToothCondition>("caries");
  const [teeth, setTeeth] = useState<Record<number, Record<string, ToothCondition>>>({});

  useEffect(() => {
    async function load() {
      try {
        const data = await getOdontograma(patientId);
        setTeeth(data || {});
      } catch (err) {
        console.error("Error cargando odontograma", err);
      }
    }
    load();
  }, [patientId]);

  const handleFaceClick = async (toothNumber: number, face: ToothFace) => {
    const updatedTeeth = { ...teeth };
    
    // 🧹 LÓGICA DE LIMPIEZA O RESET
    // Si la condición seleccionada es "normal", reseteamos todas las caras del diente
    if (selectedCondition === "normal") {
      updatedTeeth[toothNumber] = { 
        top: "normal", bottom: "normal", left: "normal", right: "normal", center: "normal" 
      };
    } 
    // Caso Ausente: Marcamos todo el bloque para mostrar la X
    else if (selectedCondition === "ausente") {
      updatedTeeth[toothNumber] = {
        top: "ausente", bottom: "ausente", left: "ausente", right: "ausente", center: "ausente"
      };
    } 
    // Pintar cara individual
    else {
      if (!updatedTeeth[toothNumber]) {
        updatedTeeth[toothNumber] = { 
          top: "normal", bottom: "normal", left: "normal", right: "normal", center: "normal" 
        };
      }
      updatedTeeth[toothNumber][face] = selectedCondition;
    }

    setTeeth(updatedTeeth);

    try {
      // 🛡️ Sincronización con Firebase
      await updateTooth({
        patientId,
        toothNumber,
        faces: updatedTeeth[toothNumber], 
      });
    } catch (err) {
      console.error("Error actualizando diente", err);
    }
  };

  const conditions: Array<{ value: ToothCondition; label: string; color: string }> = [
    { value: "normal", label: "Limpiar Diente", color: "bg-white border-slate-300" },
    { value: "caries", label: "Caries", color: "bg-red-500" },
    { value: "restauracion", label: "Restauración", color: "bg-orange-500" },
    { value: "ausente", label: "Ausente", color: "bg-slate-500" },
    { value: "corona", label: "Corona", color: "bg-purple-500" },
    { value: "endodoncia", label: "Endodoncia", color: "bg-emerald-500" },
    { value: "implante", label: "Implante", color: "bg-teal-500" },
  ];

  const renderRow = (numbers: number[]) => (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
      {numbers.map((n) => (
        <Tooth 
          key={n} 
          number={n} 
          faces={teeth[n] || { top: "normal", bottom: "normal", left: "normal", right: "normal", center: "normal" }} 
          onFaceClick={handleFaceClick} 
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Odontograma Clínico</h1>
        <p className="text-slate-400 font-medium">Seleccione una patología y marque la cara del diente</p>
      </div>

      {/* TOOLBAR PROFESIONAL */}
      <div className="mb-12 flex flex-wrap justify-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
        {conditions.map((c) => (
          <button
            key={c.value}
            onClick={() => setSelectedCondition(c.value)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 border-2 ${
              selectedCondition === c.value 
                ? "border-emerald-500 bg-white shadow-xl shadow-emerald-100 text-emerald-700" 
                : "border-transparent bg-white/50 text-slate-400 hover:bg-white hover:text-slate-600"
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${c.color} border border-black/5`} />
            {c.label}
          </button>
        ))}
      </div>

      {/* MAPA DENTAL */}
      <div className="space-y-16 p-2 md:p-4">
        <div className="flex flex-col xl:flex-row justify-center gap-12 xl:gap-24">
          {renderRow([18, 17, 16, 15, 14, 13, 12, 11])}
          {renderRow([21, 22, 23, 24, 25, 26, 27, 28])}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-dashed border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 py-1 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] border-2 border-slate-50">
              Línea Media Sagital
            </span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row justify-center gap-12 xl:gap-24">
          {renderRow([48, 47, 46, 45, 44, 43, 42, 41])}
          {renderRow([31, 32, 33, 34, 35, 36, 37, 38])}
        </div>
      </div>
    </div>
  );
}