"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  listStock, 
  updateProducto, 
  deleteArticulo, 
  createArticulo, 
  type ArticuloStock 
} from "../services/stock.api";
import toast, { Toaster } from "react-hot-toast";
import { Package, AlertTriangle, Plus, Minus, Search } from "lucide-react";
import StockModal from "../components/StockModal";
import ConfirmDialog from "../../../shared/components/ConfirmDialog"; 

export default function StockPage() {
  const [items, setItems] = useState<ArticuloStock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ArticuloStock | null>(null);
  const [search, setSearch] = useState("");

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
      await updateProducto(id, { cantidad: nueva });
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, cantidad: nueva } : item
      ));
      toast.success("Stock actualizado ✅");
    } catch {
      toast.error("No se pudo actualizar ❌");
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

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
        await updateProducto(editingItem.id, articuloData);
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

  if (loading) return (
    <div className="p-20 text-center font-bold text-amber-500 uppercase tracking-widest animate-pulse bg-[#0f1115] min-h-screen flex items-center justify-center">
      Cargando almacén de insumos...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-100 flex flex-col pb-20 font-sans">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { backgroundColor: '#161920', color: '#f1f5f9', border: '1px solid #334155' }
        }} 
      />
      
      <StockModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onSave={handleSave}
        initialData={editingItem} 
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar insumo?"
        message="Esta acción no se puede deshacer y el artículo desaparecerá del inventario."
      />

      {/* HEADER: Adaptado a paleta Barber Shop Dark */}
      <header className="w-full md:pl-64 bg-[#161920] border-b border-slate-800/40 text-white px-6 py-10 shadow-xl shrink-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-red-600 via-white to-blue-600 opacity-50" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-amber-600/10 p-3 rounded-2xl border border-amber-500/20 text-amber-500">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-amber-500 uppercase">Stock</h1>
              <p className="text-slate-400 text-xs font-medium opacity-80 uppercase tracking-widest">Control de Insumos</p>
            </div>
          </div>
          
          <div className="flex w-full md:w-auto gap-2">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="text"
                  placeholder="Buscar insumo..."
                  className="w-full bg-[#12141a] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-500 transition-all placeholder:text-slate-700 text-slate-200 font-bold"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="bg-amber-600 hover:bg-amber-500 text-white p-3 md:px-6 rounded-xl font-black shadow-lg shadow-amber-950/40 border border-amber-500/15 transition-all active:scale-95 uppercase text-sm tracking-widest flex items-center justify-center"
             >
                <Plus className="w-6 h-6 md:hidden" />
                <span className="hidden md:block tracking-widest">+ NUEVO</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: Corregido espaciado y flexbox para extender fondo sin cortes */}
      <main className="flex-1 w-full md:pl-64 p-6 mt-6 bg-[#0f1115]">
        <div className="max-w-7xl mx-auto">
          
          {/* VISTA DESKTOP */}
          <div className="hidden md:block bg-[#161920] rounded-[2.5rem] shadow-2xl border border-slate-800/80 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12141a] border-b border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cantidad</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredItems.map((item) => {
                  const esBajo = item.cantidad <= item.minimo;
                  return (
                    <motion.tr key={item.id} layout className={`group hover:bg-[#1d222e]/30 transition-colors ${esBajo ? 'bg-rose-950/10' : ''}`}>
                      <td className="px-8 py-4">
                        <div className="font-bold text-slate-200">{item.nombre}</div>
                        <div className="text-[10px] bg-[#12141a] text-slate-400 inline-block px-2 py-0.5 rounded-md border border-slate-800 font-bold uppercase mt-1">
                          {item.categoria} • {item.unidad}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleAdjust(item.id!, item.cantidad, -1)} className="p-1.5 bg-[#12141a] border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className={`text-lg font-black w-8 text-center ${esBajo ? 'text-rose-400' : 'text-slate-200'}`}>{item.cantidad}</span>
                          <button onClick={() => handleAdjust(item.id!, item.cantidad, 1)} className="p-1.5 bg-[#12141a] border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-center">
                        {esBajo ? (
                          <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-950/30 border border-rose-900/30 px-3 py-1 rounded-md animate-pulse">Stock Bajo ⚠️</span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-md">Óptimo</span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-right space-x-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2.5 bg-[#12141a] border border-slate-800 text-amber-500 hover:border-amber-500/50 rounded-xl transition-all font-bold text-xs uppercase tracking-wider">Editar</button>
                        <button onClick={() => confirmDelete(item.id!)} className="p-2.5 bg-[#12141a] border border-slate-800 text-rose-400 hover:border-rose-900/40 rounded-xl transition-all font-bold text-xs uppercase tracking-wider">Borrar</button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* VISTA MOBILE */}
          <div className="md:hidden space-y-4">
            {filteredItems.map((item) => {
              const esBajo = item.cantidad <= item.minimo;
              return (
                <motion.div key={item.id} layout className={`bg-[#161920] p-5 rounded-3xl shadow-sm border border-slate-800/80 space-y-4 ${esBajo ? 'ring-2 ring-rose-950' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-200">{item.nombre}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{item.categoria} · {item.unidad}</p>
                    </div>
                    {esBajo && <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />}
                  </div>

                  <div className="flex items-center justify-between bg-[#12141a] p-3 rounded-2xl border border-slate-800/40">
                     <div className="flex items-center gap-4">
                        <button onClick={() => handleAdjust(item.id!, item.cantidad, -1)} className="p-3 bg-[#161920] border border-slate-800 shadow-sm rounded-xl active:scale-90 transition-transform"><Minus className="w-4 h-4 text-slate-500" /></button>
                        <span className={`text-2xl font-black ${esBajo ? 'text-rose-400' : 'text-slate-200'}`}>{item.cantidad}</span>
                        <button onClick={() => handleAdjust(item.id!, item.cantidad, 1)} className="p-3 bg-[#161920] border border-slate-800 shadow-sm rounded-xl active:scale-90 transition-transform"><Plus className="w-4 h-4 text-slate-500" /></button>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-3 bg-[#161920] border border-slate-800 text-amber-500 rounded-xl active:scale-90 font-bold text-[10px] uppercase tracking-wide">Editar</button>
                        <button onClick={() => confirmDelete(item.id!)} className="p-3 bg-rose-950/20 border border-rose-900/25 text-rose-400 rounded-xl active:scale-90 font-bold text-[10px] uppercase tracking-wide">Borrar</button>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-16 text-center text-slate-600 text-sm font-medium italic">
              No se encontraron insumos que coincidan con la búsqueda.
            </div>
          )}

        </div>
      </main>
    </div>
  );
}