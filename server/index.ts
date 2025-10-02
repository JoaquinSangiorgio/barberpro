import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

const app = express();
app.use(cors());               // TIP: en prod restringí origin: app.use(cors({origin:["https://tu-frontend.com"]}))
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
});

const APP_TZ = process.env.APP_TZ || "America/Argentina/Buenos_Aires";

/** Convierte a UTC de forma robusta:
 * - Si viene con 'Z' u offset (+/-hh:mm), respeta la zona (ya UTC).
 * - Si viene "naive" (sin timezone), interpreta en APP_TZ y convierte a UTC.
 */
function parseToUtc(dateStr: string): Date {
  const hasTz = /Z$|[+-]\d{2}:\d{2}$/.test(dateStr);
  if (hasTz) return new Date(dateStr);
  return zonedTimeToUtc(dateStr, APP_TZ);
}
function todayUtcRange() {
  const now = new Date();
  const zoned = utcToZonedTime(now, APP_TZ);
  const startLocal = startOfDay(zoned);
  const endLocal = endOfDay(zoned);
  return { startUtc: zonedTimeToUtc(startLocal, APP_TZ), endUtc: zonedTimeToUtc(endLocal, APP_TZ) };
}
function monthUtcRange(date = new Date()) {
  const zoned = utcToZonedTime(date, APP_TZ);
  const startLocal = startOfMonth(zoned);
  const endLocal = endOfMonth(zoned);
  return { startUtc: zonedTimeToUtc(startLocal, APP_TZ), endUtc: zonedTimeToUtc(endLocal, APP_TZ) };
}

/* ===================== PACIENTES ===================== */
app.get("/api/patients", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const conn = await pool.getConnection();
  try {
    let sql = `SELECT id, nombre, apellido, dni, email, telefono, created_at FROM patients`;
    const args: any[] = [];
    if (q) { sql += ` WHERE CONCAT_WS(' ', nombre, apellido, dni, email, telefono) LIKE ?`; args.push(`%${q}%`); }
    sql += ` ORDER BY apellido, nombre LIMIT 500`;
    const [rows] = await conn.query(sql, args);
    res.json(rows);
  } finally { conn.release(); }
});

app.get("/api/patients/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`SELECT * FROM patients WHERE id=?`, [req.params.id]);
    res.json((rows as any[])[0] || null);
  } finally { conn.release(); }
});

app.post("/api/patients", async (req, res) => {
  const { nombre, apellido, dni, email, telefono } = req.body || {};
  if (!nombre || !apellido) return res.status(400).json({ error: "missing_fields" });
  const conn = await pool.getConnection();
  try {
    const [r] = await conn.execute(
      `INSERT INTO patients (nombre, apellido, dni, email, telefono) VALUES (?,?,?,?,?)`,
      [nombre, apellido, dni || null, email || null, telefono || null]
    );
    const id = (r as any).insertId;
    const [rows] = await conn.query(`SELECT * FROM patients WHERE id=?`, [id]);
    res.status(201).json((rows as any[])[0]);
  } finally { conn.release(); }
});

app.put("/api/patients/:id", async (req, res) => {
  const { nombre, apellido, dni, email, telefono } = req.body || {};
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      `UPDATE patients SET nombre=?, apellido=?, dni=?, email=?, telefono=? WHERE id=?`,
      [nombre, apellido, dni || null, email || null, telefono || null, req.params.id]
    );
    const [rows] = await conn.query(`SELECT * FROM patients WHERE id=?`, [req.params.id]);
    res.json((rows as any[])[0] || null);
  } finally { conn.release(); }
});

app.delete("/api/patients/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`DELETE FROM patients WHERE id=?`, [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

/* ===================== TURNOS ===================== */
app.get("/api/appointments", async (req, res) => {
  const { from, to, professional } = req.query as any;
  const conn = await pool.getConnection();
  try {
    let sql = `SELECT a.*, p.apellido, p.nombre
               FROM appointments a
               JOIN patients p ON p.id = a.patient_id
               WHERE 1=1`;
    const args: any[] = [];
    if (from) { sql += ` AND a.date_utc >= ?`; args.push(new Date(String(from))); }
    if (to)   { sql += ` AND a.date_utc <  ?`; args.push(new Date(String(to))); }
    if (professional) { sql += ` AND a.professional = ?`; args.push(String(professional)); }
    sql += ` ORDER BY a.date_utc ASC LIMIT 2000`;

    const [rows] = await conn.query(sql, args);
    const data = (rows as any[]).map(r => ({
      id: String(r.id),
      title: r.title,
      patientId: String(r.patient_id),
      professional: r.professional,
      reason: r.reason,
      dateISO: new Date(r.date_utc).toISOString(), // UTC ISO
      durationMin: r.duration_min,
      status: r.status,
      location: r.location,
      isUrgent: !!r.is_urgent,
    }));
    res.json(data);
  } finally { conn.release(); }
});

app.post("/api/appointments", async (req, res) => {
  const {
    patientId, professional, title = "Turno", reason = "",
    dateISO, durationMin = 30, status = "pending", location = "", isUrgent = 0,
  } = req.body || {};
  if (!patientId || !professional || !dateISO) return res.status(400).json({ error: "missing_fields" });
  const conn = await pool.getConnection();
  try {
    const dateUtc = parseToUtc(String(dateISO));
    const [r] = await conn.execute(
      `INSERT INTO appointments (patient_id, professional, title, reason, date_utc, duration_min, status, location, is_urgent)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [Number(patientId), professional, title, reason, dateUtc, Number(durationMin), status, location, isUrgent ? 1 : 0]
    );
    const id = (r as any).insertId;
    const [rows] = await conn.query(`SELECT * FROM appointments WHERE id=?`, [id]);
    const a: any = (rows as any[])[0];
    res.status(201).json({
      id: String(a.id),
      title: a.title,
      patientId: String(a.patient_id),
      professional: a.professional,
      reason: a.reason,
      dateISO: new Date(a.date_utc).toISOString(),
      durationMin: a.duration_min,
      status: a.status,
      location: a.location,
      isUrgent: !!a.is_urgent,
    });
  } finally { conn.release(); }
});

app.put("/api/appointments/:id", async (req, res) => {
  const {
    patientId, professional, title, reason, dateISO,
    durationMin, status, location, isUrgent,
  } = req.body || {};
  const conn = await pool.getConnection();
  try {
    const dateUtc = dateISO ? parseToUtc(String(dateISO)) : null;
    await conn.execute(
      `UPDATE appointments
       SET patient_id=?, professional=?, title=?, reason=?, date_utc=?, duration_min=?, status=?, location=?, is_urgent=?
       WHERE id=?`,
      [
        Number(patientId), professional, title, reason,
        dateUtc, Number(durationMin), status, location, isUrgent ? 1 : 0,
        req.params.id
      ]
    );
    const [rows] = await conn.query(`SELECT * FROM appointments WHERE id=?`, [req.params.id]);
    const a: any = (rows as any[])[0];
    res.json(a ? {
      id: String(a.id),
      title: a.title,
      patientId: String(a.patient_id),
      professional: a.professional,
      reason: a.reason,
      dateISO: new Date(a.date_utc).toISOString(),
      durationMin: a.duration_min,
      status: a.status,
      location: a.location,
      isUrgent: !!a.is_urgent,
    } : null);
  } finally { conn.release(); }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`DELETE FROM appointments WHERE id=?`, [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

/* ===================== PAGOS ===================== */
app.get("/api/payments", async (req, res) => {
  const { desde, hasta, metodo, q } = req.query as any;
  const conn = await pool.getConnection();
  try {
    let sql = `SELECT pay.*, p.apellido, p.nombre
               FROM payments pay
               JOIN patients p ON p.id = pay.paciente_id
               WHERE 1=1`;
    const args: any[] = [];
    if (desde) { sql += ` AND pay.fecha >= ?`; args.push(String(desde)); }
    if (hasta) { sql += ` AND pay.fecha <= ?`; args.push(String(hasta)); }
    if (metodo) { sql += ` AND pay.metodo = ?`; args.push(String(metodo)); }
    if (q) {
      sql += ` AND CONCAT_WS(' ', pay.concepto, pay.metodo, p.nombre, p.apellido) LIKE ?`;
      args.push(`%${String(q)}%`);
    }
    sql += ` ORDER BY pay.fecha DESC, pay.id DESC LIMIT 1000`;
    const [rows] = await conn.query(sql, args);
    const data = (rows as any[]).map(r => ({
      id: String(r.id),
      pacienteId: String(r.paciente_id),
      fecha: r.fecha,                 // YYYY-MM-DD
      metodo: r.metodo,
      concepto: r.concepto,
      monto: Number(r.monto),
      status: r.status,
      pacienteNombre: `${r.apellido}, ${r.nombre}`,
    }));
    res.json(data);
  } finally { conn.release(); }
});

app.post("/api/payments", async (req, res) => {
  const { pacienteId, fecha, metodo, concepto, monto, status = "approved" } = req.body || {};
  if (!pacienteId || !fecha || !metodo || !monto) return res.status(400).json({ error: "missing_fields" });
  const conn = await pool.getConnection();
  try {
    const [r] = await conn.execute(
      `INSERT INTO payments (paciente_id, fecha, metodo, concepto, monto, status)
       VALUES (?,?,?,?,?,?)`,
      [Number(pacienteId), fecha, metodo, concepto || "", Number(monto), status]
    );
    const id = (r as any).insertId;
    const [rows] = await conn.query(`SELECT * FROM payments WHERE id=?`, [id]);
    res.status(201).json((rows as any[])[0]);
  } finally { conn.release(); }
});

app.put("/api/payments/:id", async (req, res) => {
  const { pacienteId, fecha, metodo, concepto, monto, status } = req.body || {};
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      `UPDATE payments SET paciente_id=?, fecha=?, metodo=?, concepto=?, monto=?, status=? WHERE id=?`,
      [Number(pacienteId), fecha, metodo, concepto || "", Number(monto), status, req.params.id]
    );
    const [rows] = await conn.query(`SELECT * FROM payments WHERE id=?`, [req.params.id]);
    res.json((rows as any[])[0] || null);
  } finally { conn.release(); }
});

app.delete("/api/payments/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`DELETE FROM payments WHERE id=?`, [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

/* ===================== DASHBOARD ===================== */
app.get("/api/dashboard/summary", async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const { startUtc, endUtc } = todayUtcRange();
      const { startUtc: mStartUtc, endUtc: mEndUtc } = monthUtcRange();

      const [apptRows] = await conn.query(
        `SELECT status, COUNT(*) as c
         FROM appointments
         WHERE date_utc >= ? AND date_utc < ?
         GROUP BY status`,
        [startUtc, endUtc]
      );

      const [nextRows] = await conn.query(
        `SELECT a.id, a.title, a.professional, a.location, a.date_utc, a.duration_min,
                p.apellido, p.nombre
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         WHERE a.date_utc >= ? AND a.date_utc < ?
         ORDER BY a.date_utc ASC
         LIMIT 1`,
        [startUtc, endUtc]
      );

      const local = utcToZonedTime(new Date(), APP_TZ);
      const y = local.getFullYear();
      const m = local.getMonth() + 1;
      const first = `${y}-${String(m).padStart(2,"0")}-01`;
      const last = `${y}-${String(m).padStart(2,"0")}-${new Date(y, m, 0).getDate()}`;

      const [sumRows] = await conn.query(
        `SELECT COALESCE(SUM(monto),0) as total
         FROM payments
         WHERE fecha BETWEEN ? AND ? AND status='approved'`,
        [first, last]
      );

      const [newPacRows] = await conn.query(
        `SELECT COUNT(*) as total
         FROM patients
         WHERE created_at >= ? AND created_at < ?`,
        [mStartUtc, mEndUtc]
      );

      res.json({
        today: {
          byStatus: Object.fromEntries((apptRows as any[]).map(r => [r.status, Number(r.c)])),
          next: (nextRows as any[])[0] ?? null,
        },
        month: {
          revenueApproved: Number((sumRows as any[])[0]?.total ?? 0),
          newPatients: Number((newPacRows as any[])[0]?.total ?? 0),
        }
      });
    } finally { conn.release(); }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "dashboard_failed" });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API on :${port}`));
