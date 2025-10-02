import React from "react";

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
  condition: ToothCondition;
  onClick: (number: number) => void;
}

export default function Tooth({ number, condition, onClick }: Props) {
  // Estilo base responsivo
  const baseStyle =
    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-blue-500 relative text-xs sm:text-sm md:text-base";

  const getStyle = () => {
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

  const getContent = () => {
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

  return (
    <div className="flex flex-col items-center">
      {/* Número más pequeño en móvil, más grande en escritorio */}
      <div className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-600 mb-1">
        {number}
      </div>
      <div className={getStyle()} onClick={() => onClick(number)}>
        {getContent()}
      </div>
    </div>
  );
}
