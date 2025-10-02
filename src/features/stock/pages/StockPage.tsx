// src/pages/Stock.tsx
export default function Stock(){
  const items = [
    { id:1, nombre:"Guantes Nitrilo M", categoria:"Descartables", stock:12, minimo:20 },
    { id:2, nombre:"Anestésico Articaína", categoria:"Medicamentos", stock:45, minimo:30 },
    { id:3, nombre:"Resina compuesta A2", categoria:"Restauradores", stock:8, minimo:15 },
  ];
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Stock</h1>
        <div className="flex gap-2">
          <input className="input" placeholder="Buscar insumo" />
          <select className="input">
            <option>Categoría</option>
            <option>Descartables</option>
            <option>Medicamentos</option>
            <option>Restauradores</option>
          </select>
          <button className="btn-primary">Buscar</button>
        </div>
      </header>

      <div className="overflow-auto border border-black/5 rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-soft">
            <tr>
              {["Insumo","Categoría","Stock","Mínimo","Estado",""].map(h=>(
                <th key={h} className="text-left px-4 py-3 font-medium text-textc-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(it=>{
              const low = it.stock < it.minimo;
              return (
                <tr key={it.id} className="border-t border-black/5">
                  <td className="px-4 py-3">{it.nombre}</td>
                  <td className="px-4 py-3">{it.categoria}</td>
                  <td className="px-4 py-3">{it.stock}</td>
                  <td className="px-4 py-3">{it.minimo}</td>
                  <td className="px-4 py-3">
                    <span className="badge">{low ? "Bajo" : "OK"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost mr-2">Movimiento</button>
                    <button className="btn-ghost">Editar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
