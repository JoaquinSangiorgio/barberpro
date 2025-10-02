const API_URL = "https://sparkx.com.ar/api/historial.php";

export interface Historial {
  id?: number;
  patient_id: number;
  antecedentes?: string;
  alergias?: string;
  notas?: string;
  updated_at?: string;
}

// 🔹 Obtener historial de un paciente
export async function getHistorial(patientId: number): Promise<Historial | null> {
  if (!patientId) throw new Error("ID de paciente inválido");

  try {
    const res = await fetch(`${API_URL}?patient_id=${patientId}`, {
      method: "GET",
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error al obtener historial: ${txt}`);
    }

    const data = await res.json();
    console.log("📋 getHistorial() =>", data);

    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }

    return {
      id: data.id ? Number(data.id) : undefined,
      patient_id: Number(data.patient_id),
      antecedentes: data.antecedentes ?? "",
      alergias: data.alergias ?? "",
      notas: data.notas ?? "",
      updated_at: data.updated_at ?? undefined,
    };
  } catch (err) {
    console.error("❌ getHistorial error:", err);
    throw err;
  }
}

// 🔹 Crear o actualizar historial
export async function updateHistorial(historial: Historial): Promise<Historial> {
  if (!historial.patient_id) throw new Error("El historial debe tener un patient_id");

  try {
    const res = await fetch(API_URL, {
      method: "POST", // 👈 el PHP debe decidir si inserta o actualiza
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(historial),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error al guardar historial: ${txt}`);
    }

    const data = await res.json();
    console.log("💾 updateHistorial() =>", data);

    return {
      id: data.id ? Number(data.id) : historial.id,
      patient_id: Number(data.patient_id ?? historial.patient_id),
      antecedentes: data.antecedentes ?? historial.antecedentes ?? "",
      alergias: data.alergias ?? historial.alergias ?? "",
      notas: data.notas ?? historial.notas ?? "",
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
  } catch (err) {
    console.error("❌ updateHistorial error:", err);
    throw err;
  }
}
