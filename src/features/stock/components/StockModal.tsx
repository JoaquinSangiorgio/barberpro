import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Package } from "lucide-react";
import type { ArticuloStock } from "../services/stock.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (articulo: ArticuloStock) => void;
  initialData?: ArticuloStock | null; // Cambiado a opcional/null para evitar errores de tipo
}

export default function StockModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [form, setForm] = useState<ArticuloStock>({
    nombre: "",
    cantidad: 0,
    minimo: 0,
    categoria: "Insumos Clínicos",
    unidad: "Unidades"
  });

  // 🔥 Carga los datos en el formulario cuando se abre para editar
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData);
      } else {
        // Resetear si es uno nuevo
        setForm({ 
          nombre: "", 
          cantidad: 0, 
          minimo: 0, 
          categoria: "Insumos Clínicos", 
          unidad: "Unidades" 
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre) return;
    onSave(form);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Encabezado dinámico según la acción */}
            <div className={`${initialData ? 'bg-sky-600' : 'bg-indigo-700'} p-6 text-white flex justify-between items-center transition-colors`}>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {initialData ? "Editar Insumo" : "Nuevo Insumo"}
              </h2>
              <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre del Producto</label>
                <div className="relative mt-1">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 font-bold outline-none focus:border-indigo-500 transition-all"
                    placeholder="Ej: Anestesia Tubos"
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Stock Actual</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 mt-1 font-bold outline-none focus:border-indigo-500"
                    value={form.cantidad}
                    onChange={(e) => setForm({...form, cantidad: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 text-rose-500">Mínimo Alerta</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 mt-1 font-bold outline-none focus:border-rose-400"
                    value={form.minimo}
                    onChange={(e) => setForm({...form, minimo: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoría</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 mt-1 font-bold outline-none focus:border-indigo-500 appearance-none"
                    value={form.categoria}
                    onChange={(e) => setForm({...form, categoria: e.target.value})}
                  >
                    <option>Insumos Clínicos</option>
                    <option>Descartables</option>
                    <option>Cirugía</option>
                    <option>Ortodoncia</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Unidad</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 mt-1 font-bold outline-none"
                    placeholder="Cajas, ml, etc"
                    value={form.unidad}
                    onChange={(e) => setForm({...form, unidad: e.target.value})}
                  />
                </div>
              </div>

              {/* Botón dinámico */}
              <button 
                type="submit"
                className={`w-full ${initialData ? 'bg-sky-600 shadow-sky-200' : 'bg-indigo-700 shadow-indigo-200'} text-white py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
              >
                <Save className="w-5 h-5" /> 
                {initialData ? "ACTUALIZAR INSUMO" : "GUARDAR EN ALMACÉN"}
              </button>
              
              <button 
                type="button"
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-4 rounded-2xl font-bold transition-all"
              >
                Cancelar
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}