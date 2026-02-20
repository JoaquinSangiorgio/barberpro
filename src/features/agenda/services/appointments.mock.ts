/*import type { Appointment } from "../types";

const KEY = "OF__appointments_v1";
const NET_DELAY = 150;

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function read(): Appointment[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(rows: Appointment[]) { localStorage.setItem(KEY, JSON.stringify(rows)); }

function seedOnce() {
  if (localStorage.getItem(KEY)) return;
  const now = new Date();
  const at = (h: number, m = 0) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d.toISOString(); };

  const seed: Appointment[] = [
    {
      id: 1,
      title: "Control",
      patientId: 1,
      professional: "Dra. Rodríguez",
      reason: "Revisión",
      dateISO: at(10),
      durationMin: 30,
      status: "pending",
      location: "Consultorio 1",
    },
    {
      id: 2,
      title: "Limpieza",
      patientId: 2,
      professional: "Dr. Pérez",
      reason: "Profilaxis",
      dateISO: at(11, 30),
      durationMin: 45,
      status: "confirmed",
      location: "Consultorio 2",
    },
  ];
  write(seed);
}

export async function listAppointments(): Promise<Appointment[]> {
  seedOnce();
  await sleep(NET_DELAY);
  return read().sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
}

export async function createAppointment(appt: Omit<Appointment, "id"> & Partial<Pick<Appointment, "id">>) {
  await sleep(NET_DELAY);
  const rows = read();
  const id = appt.id ?? crypto.randomUUID();
  const next = { ...appt, id } as Appointment;
  rows.push(next);
  write(rows);
  return next;
}

export async function updateAppointment(appt: Appointment) {
  await sleep(NET_DELAY);
  const rows = read();
  const i = rows.findIndex(r => String(r.id) === String(appt.id));
  if (i === -1) throw new Error("Turno no encontrado");
  rows[i] = { ...rows[i], ...appt };
  write(rows);
  return rows[i];
}

export async function deleteAppointment(id: string) {
  await sleep(NET_DELAY);
  const rows = read().filter(r => String(r.id) !== String(id));
  write(rows);
  return true;
}

// util opcional para “resetear” la demo
export function resetAppointmentsDemo() { localStorage.removeItem(KEY); }*/
