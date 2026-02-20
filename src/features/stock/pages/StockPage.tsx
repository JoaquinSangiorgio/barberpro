"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listStock, updateCantidad, deleteArticulo, type ArticuloStock } from "../services/stock.api";
import toast, { Toaster } from "react-hot-toast";
import { Package, AlertTriangle, Plus, Minus, Search } from "lucide-react";
import StockModal from "../components/StockModal";
import ConfirmDialog from "../../../shared/components/ConfirmDialog"; 
import { createArticulo } from "../services/stock.api"; 

export default function StockPage() {
  const [items, setItems] = useState<ArticuloStock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ArticuloStock | null>(null);
  const [search, setSearch] = useState("");

  // 🔥 Estados para el Confirm Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const data = await listStock();
      setItems(data);
    } catch (err) {
      toast.error("Error al cargar el inventario ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleAdjust = async (id: string, current: number, diff: number) => {
    const nueva = current + diff;
    if (nueva < 0) return;
    try {
      await updateCantidad(id, nueva);
      setItems(prev => prev.map(item => item.id === id ? { ...item, cantidad: nueva } : item));
      toast.success("Stock actualizado ✅");
    } catch {
      toast.error("No se pudo actualizar ❌");
    }
  };

  // 🔥 Abrir el confirm en lugar de borrar directo
  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  // 🔥 Función que ejecuta la eliminación real
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteArticulo(itemToDelete);
      setItems(prev => prev.filter(item => item.id !== itemToDelete));
      toast.success("Insumo eliminado 🗑️");
    } catch {
      toast.error("Error al eliminar ❌");
    } finally {
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSave = async (articuloData: ArticuloStock) => {
    try {
      if (editingItem?.id) {
        await updateCantidad(editingItem.id, articuloData.cantidad);
        toast.success("Insumo actualizado ✅");
      } else {
        await createArticulo(articuloData);
        toast.success("Insumo agregado con éxito ✅");
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      refresh();
    } catch {
      toast.error("Error al procesar el insumo ❌");
    }
  };

  const filteredItems = items.filter(item => 
    item.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Cargando almacén...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster position="top-right" />
      
      <StockModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onSave={handleSave}
        initialData={editingItem} 
      />

      {/* 🔥 Componente de Confirmación */}
      <ConfirmDialog
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar insumo?"
        message="Esta acción no se puede deshacer y el artículo desaparecerá del inventario."
      />

      <header className="w-full md:pl-64 bg-gradient-to-r from-sky-700 to-emerald-600 text-white px-6 py-10 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Stock</h1>
              <p className="text-emerald-100 text-xs font-medium opacity-80 uppercase tracking-widest">Control de Insumos</p>
            </div>
          </div>
          
          <div className="flex w-full md:w-auto gap-2">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input 
                  type="text"
                  placeholder="Buscar insumo..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-white/20 transition-all placeholder:text-white/40 text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white p-3 md:px-6 rounded-xl font-black shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-6 h-6 md:hidden" />
                <span className="hidden md:block tracking-widest">+ NUEVO</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 -mt-8">
        
        {/* VISTA DESKTOP (TABLA) */}
        <div className="hidden md:block bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cantidad</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => {
                const esBajo = item.cantidad <= item.minimo;
                return (
                  <motion.tr key={item.id} layout className={`group hover:bg-slate-50/50 transition-colors ${esBajo ? 'bg-red-50/30' : ''}`}>
                    <td className="px-8 py-4">
                      <div className="font-bold text-slate-700">{item.nombre}</div>
                      <div className="text-[10px] bg-slate-100 text-slate-500 inline-block px-2 py-0.5 rounded-md font-bold uppercase mt-1">{item.categoria}</div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleAdjust(item.id!, item.cantidad, -1)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className={`text-lg font-black w-8 text-center ${esBajo ? 'text-red-600' : 'text-slate-800'}`}>{item.cantidad}</span>
                        <button onClick={() => handleAdjust(item.id!, item.cantidad, 1)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      {esBajo ? (
                        <span className="text-[10px] font-black uppercase text-red-500 bg-red-100 px-3 py-1 rounded-full animate-pulse">Stock Bajo ⚠️</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Óptimo</span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl transition-all font-bold text-xs uppercase">Editar</button>
                      <button onClick={() => confirmDelete(item.id!)} className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all font-bold text-xs uppercase">Borrar</button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* VISTA MOBILE (CARDS) */}
        <div className="md:hidden space-y-4">
          {filteredItems.map((item) => {
            const esBajo = item.cantidad <= item.minimo;
            return (
              <motion.div key={item.id} layout className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4 ${esBajo ? 'ring-2 ring-red-100' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.nombre}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.categoria} · {item.unidad}</p>
                  </div>
                  {esBajo && <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />}
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-4">
                      <button onClick={() => handleAdjust(item.id!, item.cantidad, -1)} className="p-3 bg-white shadow-sm rounded-xl active:scale-90 transition-transform"><Minus className="w-4 h-4 text-slate-400" /></button>
                      <span className={`text-2xl font-black ${esBajo ? 'text-red-600' : 'text-slate-800'}`}>{item.cantidad}</span>
                      <button onClick={() => handleAdjust(item.id!, item.cantidad, 1)} className="p-3 bg-white shadow-sm rounded-xl active:scale-90 transition-transform"><Plus className="w-4 h-4 text-slate-400" /></button>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-3 bg-sky-50 text-sky-600 rounded-xl active:scale-90 font-bold text-[10px] uppercase">Editar</button>
                      <button onClick={() => confirmDelete(item.id!)} className="p-3 bg-rose-50 text-rose-500 rounded-xl active:scale-90 font-bold text-[10px] uppercase">Borrar</button>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}