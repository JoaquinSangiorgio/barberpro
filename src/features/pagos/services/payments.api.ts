// src/services/payments.api.ts
export type Pago = {
  id: number;
  paciente_id: number;   // 👈 igual que en la base
  paciente_nombre?: string; // 👈 NUEVO: nombre completo del paciente
  fecha: string;
  metodo: string;
  concepto: string;
  monto: number;
  status: string;
  created_at?: string;
};

// 👈 NUEVO: Tipo para pacientes
export type PacienteLite = {
  id: number;
  nombre_completo: string;
};

const API_URL = "https://sparkx.com.ar/api/payments.php";
const PATIENTS_API_URL = "https://sparkx.com.ar/api/patients.php?action=dropdown"; // 👈 NUEVO

// Helper para manejar errores HTTP
async function mustOk(res: Response) {
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

// 📥 Listar pagos
export async function listPagos(): Promise<Pago[]> {
  const res = await fetch(API_URL);
  return mustOk(res);
}

// ➕ Crear pago
export async function createPago(data: Omit<Pago, "id">): Promise<Pago> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return mustOk(res);
}

// ✏️ Actualizar pago
export async function updatePago(p: Pago): Promise<void> {
  const res = await fetch(`${API_URL}?id=${p.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  await mustOk(res);
}

// 🗑️ Eliminar pago
export async function deletePago(id: number): Promise<void> {
  const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
  await mustOk(res);
}

// 👈 NUEVO: Listar pacientes para dropdown
export async function listPacientes(): Promise<PacienteLite[]> {
  const res = await fetch(PATIENTS_API_URL);
  return mustOk(res);
}


// Crear pago con Mercado Pago
export async function createMPPreference(data: {
  paciente_id: number;
  concepto: string;
  monto: number;
  cantidad: number;
}) {
  const res = await fetch("https://sparkx.com.ar/api/mp.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { init_point, payment_id, ... }
}


