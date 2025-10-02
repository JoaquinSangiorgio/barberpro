import { useEffect, useState } from "react";
import { listPacientes, type Paciente } from "../../pacientes/services/pacientes.api";

const API_URL = "https://sparkx.com.ar/api";

export default function AgendaPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState<string>("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [duracion, setDuracion] = useState(30);
  const [motivo, setMotivo] = useState("");
  const [calendarUrl, setCalendarUrl] = useState(
    "https://calendar.google.com/calendar/embed?src=frosty.sangiorgio%40gmail.com&ctz=America%2FArgentina%2FBuenos_Aires&mode=WEEK"
  );

  const [vista] = useState<"form" | "calendario">("form");

  // 🔄 Cargar pacientes
  useEffect(() => {
    listPacientes().then(setPacientes).catch(console.error);
  }, []);

  // 🔄 Refrescar calendario cada 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setCalendarUrl(
        `https://calendar.google.com/calendar/embed?src=frosty.sangiorgio%40gmail.com&ctz=America%2FArgentina%2FBuenos_Aires&mode=WEEK&_t=${Date.now()}`
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  async function crearTurno(e: React.FormEvent) {
    e.preventDefault();

    if (!pacienteId || !fecha || !hora) {
      alert("Completar paciente, fecha y hora");
      return;
    }

    try {
      const paciente = pacientes.find((p) => String(p.id) === pacienteId);
      const dateISO = new Date(`${fecha}T${hora}:00-03:00`).toISOString();

      const payload = {
        paciente_id: Number(pacienteId),
        paciente_nombre: `${paciente?.nombre} ${paciente?.apellido}`,
        reason: motivo,
        dateISO,
        durationMin: duracion,
        status: "pending",
      };

      const response = await fetch(`${API_URL}/appointments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "ok") {
        alert("Turno creado en Google Calendar ✅");
        setMotivo(""); setFecha(""); setHora(""); setPacienteId("");

        // 🔄 Refrescar el iframe inmediatamente
        setCalendarUrl(
          `https://calendar.google.com/calendar/embed?src=frosty.sangiorgio%40gmail.com&ctz=America%2FArgentina%2FBuenos_Aires&mode=WEEK&_t=${Date.now()}`
        );
      } else {
        alert(`Error creando turno: ${result.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error creando turno ❌");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="col-span-full bg-gradient-to-r from-sky-600 to-teal-600 text-white p-6 shadow w-full">
        <div className="px-10 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                📅 Agenda Médica
              </h1>
              <p className="text-sm text-sky-100">
                Administra tus turnos y visualiza el calendario en tiempo real
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {vista === "form" ? (
          <>
            {/* Formulario */}
            <form
              onSubmit={crearTurno}
              className="p-6 bg-white rounded-xl shadow-lg space-y-4 max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-semibold text-center">
                Crear Nuevo Turno
              </h2>

              <div>
                <label className="block text-sm font-medium mb-1">Paciente *</label>
                <select
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Seleccionar Paciente --</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hora *</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duración</label>
                  <select
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo</label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Limpieza dental, revisión, etc."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Guardar Turno
              </button>
            </form>

            {/* Google Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Google Calendar</h2>
              <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                <iframe
                  key={calendarUrl}
                  src={calendarUrl}
                  style={{ border: 0 }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title="Google Calendar"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Google Calendar</h2>
            <div className="h-[750px] w-full rounded-lg overflow-hidden border">
              <iframe
                key={calendarUrl}
                src={calendarUrl}
                style={{ border: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                title="Google Calendar"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
