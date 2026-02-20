import { db } from "../../../../services/firebaseConfig";
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from "firebase/firestore";

export type Pago = {
  id: string; 
  paciente_id: string; 
  paciente_nombre?: string;
  fecha: string;
  metodo: string;
  concepto: string;
  monto: number;
  status: "approved" | "pending" | "rejected"; 
  created_at?: any;
};

export type PacienteLite = {
  id: string;
  nombre_completo: string;
};

const COLLECTION_NAME = "payments";

// 📥 Listar pagos
export async function listPagos(): Promise<Pago[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pago));
  } catch (error) {
    console.error("Error listPagos:", error);
    return [];
  }
}

// ➕ Crear pago
export async function createPago(data: Omit<Pago, "id">): Promise<{id: string, status: string}> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      created_at: Timestamp.now()
    });
    // Retornamos "success" para que el frontend cierre el modal
    return { id: docRef.id, status: "success" };
  } catch (error) {
    throw error;
  }
}

// ✏️ Actualizar pago
export async function updatePago(p: Pago): Promise<{status: string}> {
  try {
    const { id, ...data } = p;
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: Timestamp.now()
    });
    return { status: "success" };
  } catch (error) {
    throw error;
  }
}

// 🗑️ Eliminar pago
export async function deletePago(id: string): Promise<{status: string}> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return { status: "success" };
  } catch (error) {
    throw error;
  }
}

// 👥 Listar pacientes para dropdown
export async function listPacientes(): Promise<PacienteLite[]> {
  const querySnapshot = await getDocs(collection(db, "patients"));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre_completo: `${data.nombre} ${data.apellido}`
    };
  });
}

// 💳 Mercado Pago
export async function createMPPreference(data: any) {
  // Nota: Asegurate de cambiar esta URL por tu backend real cuando lo tengas
  const res = await fetch("https://tus-cloud-functions-url/mp", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}