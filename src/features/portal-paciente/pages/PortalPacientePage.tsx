// src/pages/PatientPortal.tsx
export default function PatientPortal(){
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Portal del paciente</h1>

      <div className="card p-6">
        <h2 className="text-base font-semibold mb-2">Compartí el portal</h2>
        <p className="text-sm text-textc-soft">
          Enviá a tus pacientes el enlace para autogestionar sus turnos, ver indicaciones y descargar comprobantes.
        </p>
        <div className="mt-4 flex gap-2">
          <input className="input" placeholder="https://tudominio.com/portal" value="https://tudominio.com/portal" readOnly />
          <button className="btn-ghost">Copiar</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-base font-semibold mb-2">Configuración</h3>
          <div className="grid gap-3">
            <label className="text-sm text-textc-muted">Mensajes de bienvenida</label>
            <textarea className="input min-h-[100px]" placeholder="Texto inicial del portal..." />
            <button className="btn-primary w-max">Guardar</button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold mb-2">Prueba rápida</h3>
          <div className="grid gap-3">
            <input className="input" placeholder="Email de paciente" />
            <button className="btn-ghost w-max">Enviar invitación</button>
          </div>
        </div>
      </div>
    </div>
  );
}
