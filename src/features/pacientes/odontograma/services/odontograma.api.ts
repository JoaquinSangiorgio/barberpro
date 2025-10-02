const API_URL = "https://sparkx.com.ar/api/odontograma.php";

export type ToothRecord = {
  patientId: number;
  toothNumber: number;   // FDI: 11, 12, ..., 48
  status: string;        // ej: "sano" | "caries" | "ausente"
  notes?: string;
};

export const TOOTH_STATES = [
  { key: "sano", label: "Sano", color: "green", symbol: "✓" },
  { key: "caries", label: "Caries", color: "blue", symbol: "●" },
  { key: "ausente", label: "Ausente", color: "red", symbol: "✕" },
  { key: "obturado", label: "Obturación", color: "orange", symbol: "◯" },
  { key: "corona", label: "Corona", color: "purple", symbol: "⬒" },
  { key: "implante", label: "Implante", color: "black", symbol: "IM" },
];

// 📥 Obtener odontograma de un paciente
export async function getOdontograma(patientId: number): Promise<Record<number, string>> {
  const res = await fetch(`${API_URL}?patientId=${patientId}`);
  if (!res.ok) throw new Error("Error al cargar odontograma");
  const rows: ToothRecord[] = await res.json();

  const map: Record<number, string> = {};
  rows.forEach((r) => {
    map[r.toothNumber] = r.status;
  });
  return map;
}

// 💾 Guardar/actualizar un diente
export async function updateTooth(record: ToothRecord): Promise<boolean> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error("Error al actualizar diente");
  return true;
}
