import { db } from "../../../../../services/firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy 
} from "firebase/firestore";

export type DashboardSummary = {
  citasHoy: number;
  pendientesHoy: number;
  pendientesTotales: number;
  citasUltimaFecha: number;
  fechaMostrada: string | null;
  statusSummary: Record<string, number>;
  recentAppointments: {
    paciente: string;
    practica: string;
    status: string;
    hora: string;
    fecha: string;
    dateISO: string;
  }[];
};

const APPOINTMENTS_COL = "appointments";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. QUERIES
  
  // Para el contador de hoy
  const qHoy = query(
    collection(db, APPOINTMENTS_COL), 
    where("dateISO", ">=", todayStr + " 00:00:00"),
    where("dateISO", "<=", todayStr + " 23:59:59")
  );
  
  // Para el resumen de estados GLOBAL (todas las citas existentes)
  const qAll = query(collection(db, APPOINTMENTS_COL));

  // Para las próximas 5 citas desde ahora en adelante
  const qRecientes = query(
    collection(db, APPOINTMENTS_COL),
    where("dateISO", ">=", todayStr + " 00:00:00"),
    orderBy("dateISO", "asc"),
    limit(5)
  );

  const [snapHoy, snapAll, snapRecientes] = await Promise.all([
    getDocs(qHoy),
    getDocs(qAll),
    getDocs(qRecientes)
  ]);

  // 2. PROCESAR STATUS SUMMARY GLOBAL
  // Inicializamos para que siempre existan los contadores aunque estén en 0
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    no_show: 0,
    cancelled: 0
  };

  snapAll.docs.forEach(doc => {
    const status = doc.data().status || "pending";
    if (statusMap.hasOwnProperty(status)) {
      statusMap[status]++;
    }
  });

  // 3. PROCESAR CITAS RECIENTES (Con fecha y hora)
  const recent = snapRecientes.docs.map(doc => {
    const data = doc.data();
    const rawDate = data.dateISO || "";
    
    let horaFormateada = "--:--";
    let fechaFormateada = "--/--";

    if (rawDate) {
      // Normalizamos el separador (por si hay T o espacios)
      const cleanDate = rawDate.replace("T", " ");
      
      // Extraer Fecha (DD/MM)
      const soloFecha = cleanDate.split(" ")[0]; 
      if (soloFecha.includes("-")) {
        const [y, m, d] = soloFecha.split("-");
        fechaFormateada = `${d}/${m}`;
      }

      // Extraer Hora (HH:mm)
      if (cleanDate.includes(" ")) {
        const horaPart = cleanDate.split(" ")[1];
        if (horaPart) horaFormateada = horaPart.substring(0, 5);
      }
    }

    return {
      paciente: data.paciente_nombre || "Paciente sin nombre",
      practica: data.reason || "Consulta",
      status: data.status || "pending",
      hora: horaFormateada,
      fecha: fechaFormateada,
      dateISO: rawDate
    };
  });

  return {
    citasHoy: snapHoy.size,
    pendientesHoy: statusMap["pending"] || 0,
    pendientesTotales: statusMap["pending"] || 0,
    citasUltimaFecha: snapHoy.size,
    fechaMostrada: todayStr,
    statusSummary: statusMap,
    recentAppointments: recent
  };
}