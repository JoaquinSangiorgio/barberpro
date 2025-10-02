export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "no_show"
  | "cancelled";

export type Appointment = {
  id: string;               // 👈 string (antes number)
  title: string;
  patientId: string;        // 👈 string (antes number)
  professional: string;
  reason?: string;
  dateISO: string;          // ISO string
  durationMin: number;      // ej: 30
  status: AppointmentStatus;
  isUrgent?: boolean;
  notes?: string;
  location?: string;        // "Consultorio 1"
};

export type Range = "day" | "week" | "month";
