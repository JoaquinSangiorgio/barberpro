import { db } from "../../../../services/firebaseConfig";
import {
  collection, addDoc, getDocs, query,
  orderBy, limit, writeBatch, doc, Timestamp,
} from "firebase/firestore";
import type { Pago } from "./payments.api";

export type ResumenBarbero = {
  nombre: string;
  cortes: number;
  total: number;
};

export type CierreCaja = {
  id: string;
  fecha: string;
  hora: string;
  timestamp: string;
  barberos: ResumenBarbero[];
  total_general: number;
  pagos_cerrados: number;
};

export async function cerrarCaja(pagosAbiertos: Pago[]): Promise<CierreCaja> {
  if (pagosAbiertos.length === 0) throw new Error("No hay pagos para cerrar");

  // Solo los aprobados cuentan para el resumen económico
  const aprobados = pagosAbiertos.filter((p) => p.status === "approved");

  const porBarbero: Record<string, ResumenBarbero> = {};
  for (const p of aprobados) {
    const nombreCrudo = p.barbero?.trim() || "Sin asignar";
    // Forzamos minúsculas para la clave del objeto para unificar "Franco" y "franco"
    const key = nombreCrudo.toLowerCase(); 

    if (!porBarbero[key]) {
      porBarbero[key] = { 
        nombre: nombreCrudo, // Guardamos el nombre original con sus mayúsculas
        cortes: 0, 
        total: 0 
      };
    }
    porBarbero[key].cortes += 1;
    porBarbero[key].total += Number(p.monto) || 0;
  }

  const now = new Date();
  const barberos = Object.values(porBarbero);
  const total_general = barberos.reduce((s, b) => s + b.total, 0);

  const cierrePayload = {
    fecha: now.toISOString().split("T")[0],
    hora: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: now.toISOString(),
    barberos,
    total_general,
    pagos_cerrados: pagosAbiertos.length,
    created_at: Timestamp.now(),
  };

  // 1. Guardar el cierre
  const cierreRef = await addDoc(collection(db, "cierres_caja"), cierrePayload);

  // 2. Marcar TODOS los pagos abiertos como cerrados (batch, límite 500 ops)
  const batch = writeBatch(db);
  for (const p of pagosAbiertos) {
    batch.update(doc(db, "payments", p.id), {
      cerrado: true,
      cierre_id: cierreRef.id,
    });
  }
  await batch.commit();

  return { id: cierreRef.id, ...cierrePayload };
}

// Historial optimizado para no saturar lecturas en Firestore
export async function listCierres(): Promise<CierreCaja[]> {
  const q = query(
    collection(db, "cierres_caja"),
    orderBy("created_at", "desc"),
    limit(30) // 🔒 Candado de seguridad para traer solo los últimos 30 días
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CierreCaja, "id">) }));
}

export async function getLastCierre(): Promise<CierreCaja | null> {
  const q = query(
    collection(db, "cierres_caja"),
    orderBy("created_at", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<CierreCaja, "id">) };
}