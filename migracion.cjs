const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


const pacientes = [
  { id: 1, nombre: 'Analia', apellido: 'Pérez', dni: '30111222', email: 'ana@example.com', telefono: '1155552' },
  { id: 13, nombre: 'Fernando', apellido: 'Vera', dni: '40661259', email: 'fernando@gmail.com', telefono: '' }
  
];

const turnos = [
  { id: 3, patient_id: 1, professional: 'Dra. Rodríguez', date_utc: '2025-09-17 21:00:00', status: 'cancelled' },
  { id: 19, patient_id: 13, professional: 'Dra. Rodríguez', date_utc: '2025-09-16 11:30:00', status: 'pending' }
  // ... agregar los 20 turnos del SQL
];

async function subirDatos() {
  console.log("Iniciando migración...");

  // 1. Subir Pacientes
  for (const p of pacientes) {
    await db.collection('patients').doc(p.id.toString()).set({
      nombre: p.nombre,
      apellido: p.apellido,
      dni: p.dni,
      email: p.email,
      telefono: p.telefono,
      source: 'sql_migration'
    });
  }

  // 2. Subir Turnos (Appointments)
  for (const t of turnos) {
    await db.collection('appointments').doc(t.id.toString()).set({
      patient_id: t.patient_id.toString(),
      professional: t.professional,
      date_iso: new Date(t.date_utc).toISOString(),
      status: t.status
    });
  }

  console.log("Migración completada exitosamente.");
}

subirDatos().catch(console.error);