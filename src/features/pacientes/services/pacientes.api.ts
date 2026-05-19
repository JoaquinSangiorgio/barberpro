import { db } from "../../../../services/firebaseConfig";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from "firebase/firestore";

export interface Paciente {
  id: string; 
  nombre: string;
  apellido: string;
  dni?: string;
  email?: string;
  telefono?: string;
  created_at?: any;
  updated_at?: any;
  foto?: string; 
}

export type PacienteInput = Omit<Paciente, "id" | "created_at" | "updated_at">;

const COLLECTION_NAME = "patients";

// 📄 OBTENER UN PACIENTE
export async function getPaciente(id: string): Promise<Paciente> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`No se encontró el paciente`);
  }

  return { id: docSnap.id, ...docSnap.data() } as Paciente;
}

// 📥 LISTAR PACIENTES
export async function listPacientes(): Promise<Paciente[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("apellido", "asc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Paciente));
}

// ➕ CREAR PACIENTE
export async function createPaciente(p: PacienteInput) {
  const cleanData = JSON.parse(JSON.stringify(p)); 
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...cleanData,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  });
  
  return { id: docRef.id, status: "success" };
}

// ✏️ ACTUALIZAR PACIENTE
export async function updatePaciente(id: string, p: PacienteInput) {
  const docRef = doc(db, COLLECTION_NAME, id);
  const cleanData = JSON.parse(JSON.stringify(p));

  await updateDoc(docRef, {
    ...cleanData,
    updated_at: Timestamp.now()
  });
  
  return { status: "success" };
}

// ❌ ELIMINAR PACIENTE
export async function deletePaciente(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
  
  return { status: "success" };
}