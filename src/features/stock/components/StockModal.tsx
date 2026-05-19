"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Package, Hash, AlertCircle } from "lucide-react";
import type { ArticuloStock } from "../services/stock.api";
import { ChartCandlestick } from "lucide-react"

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (articulo: ArticuloStock) => void;
  initialData?: ArticuloStock | null;
}

export default function StockModal({ isOpen, onClose, onSave, initialData }: Props) {
  // Estado inicial limpio
  const defaultForm = {
    nombre: "",
    cantidad: 0 as any, // Usamos any para permitir el "" temporalmente
    minimo: 0 as any,
    categoria: "Insumos",
    unidad: "Unidades"
  };

  const [form, setForm] = useState<ArticuloStock>(defaultForm as any);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...initialData } : (defaultForm as any));
    }
  }, [isOpen, initialData]);

  // 🛠️ Función mágica para que puedas borrar el "0" sin problemas
  const handleNumberChange = (field: "cantidad" | "minimo", value: string) => {
    if (value === "") {
      setForm({ ...form, [field]: "" as any });
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setForm({ ...form, [field]: num });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    // 🧹 Limpieza final: convertimos los vacíos "" de nuevo a 0 antes de guardar
    const dataToSave: ArticuloStock = {
      ...form,
      cantidad: Number(form.cantidad) || 0,
      minimo: Number(form.minimo) || 0,
    };

    onSave(dataToSave);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#161920] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-800/80 overflow-hidden relative"
          >
            <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            {/* Header adaptado con fondo oscuro unificado */}
            <div className="bg-[#12141a] p-6 text-white flex justify-between items-center border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-100">
                  {initialData ? "Editar Insumo" : "Nuevo Insumo"}
                </h2>
              </div>
              <button onClick={onClose} className="hover:bg-slate-800 p-2 rounded-xl transition-colors text-slate-500 hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Nombre */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nombre del Producto</label>
                <div className="relative mt-1">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                  <input 
                    required
                    type="text"
                    className="w-full bg-[#12141a] border-2 border-slate-800 rounded-2xl py-3 pl-12 pr-4 font-bold outline-none focus:border-amber-500 text-slate-200 text-base placeholder:text-slate-700 transition-all"
                    placeholder="Ej: Pomada, Navajas..."
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                  />
                </div>
              </div>

              {/* Cantidades */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest flex items-center gap-1">
                    <ChartCandlestick className="w-4 h-4 text-amber-500" /> Stock Actual
                  </label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full bg-[#12141a] border-2 border-slate-800 rounded-2xl py-3 px-4 mt-1 font-bold outline-none focus:border-amber-500 text-slate-200 text-base"
                    value={form.cantidad}
                    onChange={(e) => handleNumberChange("cantidad", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-rose-400 ml-1 tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Mínimo Alerta
                  </label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full bg-[#12141a] border-2 border-slate-800 rounded-2xl py-3 px-4 mt-1 font-bold outline-none focus:border-rose-500 text-slate-200 text-base"
                    value={form.minimo}
                    onChange={(e) => handleNumberChange("minimo", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
              </div>

              {/* Botones */}
              <div className="pt-2 space-y-3">
                <button 
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-amber-950/40 border border-amber-500/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wider"
                >
                  <Save className="w-5 h-5" /> 
                  {initialData ? "GUARDAR CAMBIOS" : "AÑADIR AL STOCK"}
                </button>
                
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-full bg-[#12141a] border border-slate-800 text-slate-400 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm uppercase tracking-wide"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}