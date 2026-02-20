import { db } from "../../../../../services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION_NAME = "odontograms";

// 🔥 Definimos la estructura para las caras del diente
export type ToothCondition = "normal" | "caries" | "restauracion" | "ausente" | "corona" | "endodoncia" | "implante";

export type ToothUpdateInput = {
  patientId: string | number;
  toothNumber: number;
  faces: Record<string, ToothCondition>;
};

// 📥 Cargar odontograma completo del paciente
export async function getOdontograma(patientId: string | number): Promise<Record<number, Record<string, ToothCondition>>> {
  const docRef = doc(db, COLLECTION_NAME, patientId.toString());
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Record<number, Record<string, ToothCondition>>;
  }
  
  return {}; 
}

// 💾 Guardar o actualizar un diente específico
export async function updateTooth({ patientId, toothNumber, faces }: ToothUpdateInput): Promise<boolean> {
  const docRef = doc(db, COLLECTION_NAME, patientId.toString());

  try {
    
    await setDoc(docRef, {
      [toothNumber]: faces
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    throw new Error("No se pudo guardar el odontograma");
  }
}