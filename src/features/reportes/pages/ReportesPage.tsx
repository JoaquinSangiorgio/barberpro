// src/pages/Reports.tsx
export default function Reports(){
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Reportes</h1>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="card p-6">
          <h2 className="text-base font-semibold">Facturación</h2>
          <p className="text-sm text-textc-soft mt-2">Resumen de ingresos por período.</p>
          <button className="btn-ghost mt-4">Ver detalle</button>
        </div>
        <div className="card p-6">
          <h2 className="text-base font-semibold">Asistencia</h2>
          <p className="text-sm text-textc-soft mt-2">Tasa de asistencia y cancelaciones.</p>
          <button className="btn-ghost mt-4">Ver detalle</button>
        </div>
        <div className="card p-6">
          <h2 className="text-base font-semibold">Productividad</h2>
          <p className="text-sm text-textc-soft mt-2">Turnos por profesional / práctica.</p>
          <button className="btn-ghost mt-4">Ver detalle</button>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-base font-semibold mb-4">Filtros</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input className="input" type="month" />
          <select className="input">
            <option>Reporte</option>
            <option>Facturación</option>
            <option>Asistencia</option>
            <option>Productividad</option>
          </select>
          <select className="input">
            <option>Profesional</option>
            <option>Dra. Gómez</option>
            <option>Dr. Pérez</option>
          </select>
          <button className="btn-primary">Generar</button>
        </div>
      </section>
    </div>
  );
}
