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
  barbero?: string;
  cerrado?: boolean;
  cierre_id?: string;
  created_at?: any;
  updated_at?: any;
};

export type PacienteLite = {
  id: string;
  nombre_completo: string;
};

const COLLECTION_NAME = "payments";

// Helper para limpiar campos 'undefined' y evitar que Firestore falle
const cleanFirestoreData = (obj: any) => JSON.parse(JSON.stringify(obj));

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
    // 💡 Corrección: Limpiamos datos opcionales por si paciente_nombre viene undefined
    const cleanData = cleanFirestoreData(data);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...cleanData,
      created_at: Timestamp.now()
    });
    return { id: docRef.id, status: "success" };
  } catch (error) {
    console.error("Error createPago:", error);
    throw error;
  }
}

// ✏️ Actualizar pago
export async function updatePago(p: Pago): Promise<{status: string}> {
  try {
    const { id, ...data } = p;
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // 💡 Corrección: Evitamos que campos opcionales rompan la actualización
    const cleanData = cleanFirestoreData(data);

    await updateDoc(docRef, {
      ...cleanData,
      updated_at: Timestamp.now()
    });
    return { status: "success" };
  } catch (error) {
    console.error("Error updatePago:", error);
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
    console.error("Error deletePago:", error);
    throw error;
  }
}

// 👥 Listar pacientes para dropdown (Corregido con orden alfabético y try/catch)
export async function listPacientes(): Promise<PacienteLite[]> {
  try {
    // 💡 Corrección: Ordenamos por apellido para que el dropdown sea legible
    const q = query(collection(db, "patients"), orderBy("apellido", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Manejo seguro por si no existen nombre o apellido en algún documento roto
        nombre_completo: `${data.nombre || ""} ${data.apellido || ""}`.trim()
      };
    });
  } catch (error) {
    console.error("Error listPacientes para dropdown:", error);
    return [];
  }
}

// 💳 Mercado Pago
export async function createMPPreference(data: any) {
  try {
    const res = await fetch("https://tus-cloud-functions-url/mp", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (error) {
    console.error("Error en Mercado Pago Preference:", error);
    throw error;
  }
}