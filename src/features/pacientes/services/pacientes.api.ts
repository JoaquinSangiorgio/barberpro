const API = "https://sparkx.com.ar/api/patients.php";

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  email: string;
  telefono?: string;
  created_at?: string;
  updated_at?: string;
  foto?: string; 
}

export type PacienteInput = Omit<Paciente, "id" | "created_at" | "updated_at">;

async function mustOk(r: Response, msg: string) {
  if (!r.ok) throw new Error(`${msg} (HTTP ${r.status})`);
  return r;
}

export async function getPaciente(id: number): Promise<Paciente> {
  const res = await mustOk(
    await fetch(`${API}?id=${id}`),
    `No pude obtener paciente con id=${id}`
  );
  return res.json();
}

export async function listPacientes(): Promise<Paciente[]> {
  const res = await mustOk(await fetch(API), "No pude listar pacientes");
  return res.json();
}

export async function createPaciente(p: PacienteInput) {
  const res = await mustOk(
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    }),
    "No pude crear paciente"
  );
  return res.json();
}

export async function updatePaciente(id: number, p: PacienteInput) {
  const res = await mustOk(
    await fetch(`${API}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    }),
    "No pude actualizar paciente"
  );
  return res.json();
}

export async function deletePaciente(id: number) {
  const res = await mustOk(
    await fetch(`${API}?id=${id}`, { method: "DELETE" }),
    "No pude borrar paciente"
  );
  return res.json();
}
