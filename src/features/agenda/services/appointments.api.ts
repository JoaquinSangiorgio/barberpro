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

export type Appointment = {
  id: string;
  db_id?: number; 

  title: string;
  reason?: string;
  paciente_nombre?: string;
  paciente_id?: string | number;
  professional?: string;
  status?: string;

  dateISO: string;
  endISO?: string;

  durationMin?: number;
  description?: string;
};

const COLLECTION_NAME = "appointments";

// 📥 LISTAR TURNOS
export async function listAppointments(): Promise<Appointment[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("dateISO", "asc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
}

// 📄 OBTENER UN TURNO
export async function getAppointmentById(id: string): Promise<Appointment> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`No se encontró el turno con id: ${id}`);
  }

  return { id: docSnap.id, ...docSnap.data() } as Appointment;
}

// ➕ CREAR TURNO
export async function createAppointment(a: Omit<Appointment, "id">) {
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...a,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  });

  return { id: docRef.id, status: "success" };
}

// ✏️ EDITAR TURNO

export async function updateAppointment(appt: any) {
  try {
    const docRef = doc(db, "appointments", appt.id); // 👈 Aquí usa appt.id
    await updateDoc(docRef, appt);
    return { status: "ok" };
  } catch (error) {
    return { status: "error", error };
  }
}

// ❌ ELIMINAR TURNO
export async function deleteAppointment(id: string) {
  try {
    // Referencia al documento específico por su ID de Firebase
    const docRef = doc(db, "appointments", id);
    await deleteDoc(docRef);
    
    return { status: "ok" };
  } catch (error) {
    console.error("Error eliminando turno en Firestore:", error);
    return { status: "error", message: error };
  }
}