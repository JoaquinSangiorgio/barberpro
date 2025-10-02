import React, { useState, useEffect } from "react";
import { getOdontograma, updateTooth } from "../services/odontograma.api";

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
  const [selectedCondition, setSelectedCondition] =
    useState<ToothCondition>("normal");
  const [teeth, setTeeth] = useState<Record<number, ToothCondition>>({});

  // 📥 cargar odontograma desde la API
  useEffect(() => {
    async function load() {
      try {
        const data = await getOdontograma(patientId);
        setTeeth(data as Record<number, ToothCondition>);
      } catch (err) {
        console.error("Error cargando odontograma", err);
      }
    }
    load();
  }, [patientId]);

  const handleToothClick = async (toothNumber: number) => {
    const newCondition = selectedCondition;
    setTeeth((prev) => ({ ...prev, [toothNumber]: newCondition }));

    try {
      await updateTooth({
        patientId,
        toothNumber,
        status: newCondition,
      });
    } catch (err) {
      console.error("Error actualizando diente", err);
    }
  };

  const baseStyle =
    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-blue-500 text-xs sm:text-sm md:text-base";

  const getToothStyle = (condition: ToothCondition): string => {
    switch (condition) {
      case "caries":
        return `${baseStyle} bg-red-500 text-white`;
      case "restauracion":
        return `${baseStyle} bg-orange-500 text-white`;
      case "ausente":
        return `${baseStyle} bg-gray-500 text-white`;
      case "corona":
        return `${baseStyle} bg-purple-500 text-white`;
      case "endodoncia":
        return `${baseStyle} bg-green-500 text-white`;
      case "implante":
        return `${baseStyle} bg-teal-500 text-white`;
      default:
        return `${baseStyle} bg-white`;
    }
  };

  const getToothContent = (condition: ToothCondition): string => {
    switch (condition) {
      case "ausente":
        return "X";
      case "caries":
        return "C";
      case "restauracion":
        return "R";
      case "corona":
        return "Co";
      case "endodoncia":
        return "E";
      case "implante":
        return "I";
      default:
        return "";
    }
  };

  const conditions: Array<{
    value: ToothCondition;
    label: string;
    color: string;
  }> = [
    { value: "normal", label: "Normal", color: "bg-white border-gray-700" },
    { value: "caries", label: "Caries", color: "bg-red-500" },
    { value: "restauracion", label: "Restauración", color: "bg-orange-500" },
    { value: "ausente", label: "Ausente", color: "bg-gray-500" },
    { value: "corona", label: "Corona", color: "bg-purple-500" },
    { value: "endodoncia", label: "Endodoncia", color: "bg-green-500" },
    { value: "implante", label: "Implante", color: "bg-teal-500" },
  ];

  const clearAll = () => {
    const clearedTeeth: Record<number, ToothCondition> = {};
    Object.keys(teeth).forEach((key) => {
      clearedTeeth[parseInt(key)] = "normal";
    });
    setTeeth(clearedTeeth);
  };

  // 👉 Render de cuadrante
  const renderRow = (numbers: number[], showTop = true) => (
    <div className="flex gap-2 sm:gap-3">
      {numbers.map((toothNumber) => (
        <div key={toothNumber} className="flex flex-col items-center">
          {showTop && (
            <div className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1">
              {toothNumber}
            </div>
          )}
          <div
            className={getToothStyle(teeth[toothNumber])}
            onClick={() => handleToothClick(toothNumber)}
          >
            {getToothContent(teeth[toothNumber])}
          </div>
          {!showTop && (
            <div className="text-[10px] sm:text-xs font-bold text-gray-600 mt-1">
              {toothNumber}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
        Odontograma
      </h1>

      {/* Controles */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
          Selecciona una condición:
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-4">
          {conditions.map((condition) => (
            <button
              key={condition.value}
              onClick={() => setSelectedCondition(condition.value)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 ${
                selectedCondition === condition.value
                  ? "border-blue-500 shadow-md transform scale-105"
                  : "border-gray-300 hover:border-gray-400"
              } ${condition.color} ${
                condition.value !== "normal" ? "text-white" : "text-gray-700"
              } text-xs sm:text-sm`}
            >
              {condition.label}
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base"
          >
            Limpiar Todo
          </button>
        </div>
      </div>

      {/* Odontograma */}
      <div className="space-y-6 overflow-x-auto">
        {/* Cuadrantes superiores */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12">
          {renderRow([18, 17, 16, 15, 14, 13, 12, 11], true)}
          {renderRow([21, 22, 23, 24, 25, 26, 27, 28], true)}
        </div>

        <div className="border-t-2 border-gray-400 my-4"></div>

        {/* Cuadrantes inferiores */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12">
          {renderRow([48, 47, 46, 45, 44, 43, 42, 41], false)}
          {renderRow([31, 32, 33, 34, 35, 36, 37, 38], false)}
        </div>
      </div>
    </div>
  );
}
