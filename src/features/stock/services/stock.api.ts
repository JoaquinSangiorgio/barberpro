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



export interface DatosProducto {
  nombre: string;
  categoria: string;
  unidad: string; 
}
//

// ... tus imports y interfaces se mantienen igual ...

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
  const { id, ...dataToSave } = item; // Limpieza de ID
  
  await setDoc(newDocRef, {
    ...dataToSave,
    updated_at: serverTimestamp()
  });
  return { id: newDocRef.id, status: "success" };
}

// 🔄 ACTUALIZACIÓN FLEXIBLE
export async function updateProducto(id: string, datos: Partial<ArticuloStock>) {
  const docRef = doc(db, COLLECTION_NAME, id);
  const { id: _, ...dataToUpdate } = datos; 

  try {
    await updateDoc(docRef, {
      ...dataToUpdate,
      updated_at: serverTimestamp()
    });
    return { status: "success" };
  } catch (error) {
    console.error("Error al actualizar (Stock Update):", error);
    return { status: "error", error };
  }
}

// ❌ ELIMINAR ARTÍCULO
export async function deleteArticulo(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id); // Uso de la constante
  await deleteDoc(docRef);
  return { status: "success" };
}