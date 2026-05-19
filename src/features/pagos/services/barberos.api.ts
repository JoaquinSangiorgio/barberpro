import { db } from "../../../../services/firebaseConfig";
import {
  collection, getDocs, addDoc, deleteDoc,
  doc, query, orderBy,
} from "firebase/firestore";

export type Barbero = {
  id: string;
  nombre: string;
};

export async function listBarberos(): Promise<Barbero[]> {
  const q = query(collection(db, "barberos"), orderBy("nombre", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Barbero, "id">) }));
}

export async function createBarbero(nombre: string): Promise<Barbero> {
  const ref = await addDoc(collection(db, "barberos"), { nombre });
  return { id: ref.id, nombre };
}

export async function deleteBarbero(id: string): Promise<void> {
  await deleteDoc(doc(db, "barberos", id));
}
