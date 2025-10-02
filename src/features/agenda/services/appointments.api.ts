const API_URL = "https://sparkx.com.ar/api/appointments.php";

export type Appointment = {
  id: string;
  title: string;
  dateISO: string;
  endISO?: string;
  description?: string;
};

// 📥 Listar turnos (Google Calendar)
export async function listAppointments(): Promise<Appointment[]> {
  const res = await fetch(API_URL);
  return res.json();
}

// ➕ Crear turno
export async function createAppointment(a: {
  paciente_id: number;
  paciente_nombre: string;
  professional: string;
  reason: string;
  dateISO: string;
  durationMin: number;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a),
  });
  return res.json();
}

// ❌ Eliminar turno
export async function deleteAppointment(id: string) {
  const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
  return res.json();
}
