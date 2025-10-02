const API_URL = "https://sparkx.com.ar/api/archivos.php";

export interface Archivo {
  id?: number;
  patient_id: number;
  nombre: string;
  tipo: string;
  url?: string;
}

// 🔹 Listar archivos de un paciente
export async function listArchivos(patientId: number): Promise<Archivo[]> {
  if (!patientId) throw new Error("ID de paciente inválido");

  try {
    const res = await fetch(`${API_URL}?patient_id=${patientId}`, {
      method: "GET",
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error al obtener archivos: ${txt}`);
    }

    const data = await res.json();
    console.log("📂 listArchivos() =>", data);

    return Array.isArray(data) ? data.map((a) => ({
      id: a.id ? Number(a.id) : undefined,
      patient_id: Number(a.patient_id ?? patientId),
      nombre: a.nombre ?? "",
      tipo: a.tipo ?? "desconocido",
      url: a.url ?? undefined,
    })) : [];
  } catch (err) {
    console.error("❌ listArchivos error:", err);
    throw err;
  }
}

// 🔹 Subir archivo
export async function uploadArchivo(patientId: number, file: File): Promise<Archivo> {
  if (!patientId) throw new Error("ID de paciente inválido");
  if (!file) throw new Error("Archivo no válido");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("patient_id", String(patientId));

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error al subir archivo: ${txt}`);
    }

    const data = await res.json();
    console.log("⬆ uploadArchivo() =>", data);

    return {
      id: data.id ? Number(data.id) : undefined,
      patient_id: Number(data.patient_id ?? patientId),
      nombre: data.nombre ?? "",
      tipo: data.tipo ?? file.type,
      url: data.url ?? undefined,
    };
  } catch (err) {
    console.error("❌ uploadArchivo error:", err);
    throw err;
  }
}

// 🔹 Eliminar archivo
export async function deleteArchivo(fileId: number): Promise<boolean> {
  if (!fileId) throw new Error("ID de archivo inválido");

  try {
    const res = await fetch(`${API_URL}?id=${fileId}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
      },
    });

    const text = await res.text();
    console.log("🗑 deleteArchivo() raw =>", text);

    if (!res.ok) {
      throw new Error(`Error al eliminar archivo: ${text}`);
    }

    const data = text ? JSON.parse(text) : {};
    if (data?.status === "ok") {
      console.log("✅ deleteArchivo() => archivo eliminado");
      return true;
    }

    throw new Error(`Error inesperado al eliminar archivo: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error("❌ deleteArchivo error:", err);
    throw err;
  }
}

