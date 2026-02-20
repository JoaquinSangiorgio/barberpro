import { db } from "../../../../services/firebaseConfig";
import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp 
} from "firebase/firestore";

export interface Historial {
  id?: string | number;
  patient_id: string | number;
  antecedentes?: string;
  alergias?: string;
  notas?: string;
  updated_at?: any;
}

const COLLECTION_NAME = "historial_pacientes";

// 🔹 Obtener historial de un paciente
export async function getHistorial(patientId: string | number): Promise<Historial | null> {
  if (!patientId) throw new Error("ID de paciente inválido");

  try {
    // Usamos el patientId como ID del documento para que la búsqueda sea directa
    const docRef = doc(db, COLLECTION_NAME, patientId.toString());
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`📋 No hay historial previo para el paciente ${patientId}`);
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      patient_id: data.patient_id,
      antecedentes: data.antecedentes ?? "",
      alergias: data.alergias ?? "",
      notas: data.notas ?? "",
      updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : undefined,
    } as Historial;

  } catch (err) {
    console.error("❌ getHistorial error:", err);
    throw err;
  }
}

// 🔹 Crear o actualizar historial
export async function updateHistorial(historial: Historial): Promise<Historial> {
  if (!historial.patient_id) throw new Error("El historial debe tener un patient_id");

  try {
    const docRef = doc(db, COLLECTION_NAME, historial.patient_id.toString());
    
    const dataToSave = {
      patient_id: historial.patient_id.toString(),
      antecedentes: historial.antecedentes ?? "",
      alergias: historial.alergias ?? "",
      notas: historial.notas ?? "",
      updated_at: Timestamp.now(),
    };

    // setDoc con { merge: true } decide automáticamente si crea o actualiza
    await setDoc(docRef, dataToSave, { merge: true });

    console.log("💾 Historial guardado en Firestore para el paciente:", historial.patient_id);

    return {
      ...historial,
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("❌ updateHistorial error:", err);
    throw err;
  }
}