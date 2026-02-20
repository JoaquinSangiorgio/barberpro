import { db } from "../../../../services/firebaseConfig";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";

export interface ArticuloStock {
  id?: string;
  nombre: string;
  cantidad: number;
  minimo: number; 
  categoria: string;
  unidad: string; 
}

const COLLECTION_NAME = "stock";

// 📥 LISTAR TODO EL STOCK
export async function listStock(): Promise<ArticuloStock[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("nombre", "asc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ArticuloStock));
}

// ➕ AGREGAR NUEVO ARTÍCULO
export async function createArticulo(item: ArticuloStock) {
  const newDocRef = doc(collection(db, COLLECTION_NAME));
  await setDoc(newDocRef, {
    ...item,
    updated_at: serverTimestamp()
  });
  return { id: newDocRef.id, status: "success" };
}

// 🔄 ACTUALIZAR CANTIDAD (Entrada/Salida)
export async function updateCantidad(id: string, nuevaCantidad: number) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    cantidad: nuevaCantidad,
    updated_at: serverTimestamp()
  });
  return { status: "success" };
}

// ❌ ELIMINAR ARTÍCULO
export async function deleteArticulo(id: string) {
  const docRef = doc(db, "stock", id);
  await deleteDoc(docRef);
  return { status: "success" };
}