const API_URL = "https://sparkx.com.ar/api/appointments.php?summary=1";

export type StatusSummary = Record<
  "pending" | "confirmed" | "checked_in" | "completed" | "no_show" | "cancelled",
  number
>;

export type RecentAppointment = {
  id: number;
  title: string;
  professional: string;
  date_utc: string;
  status: string;
  nombre?: string;
  apellido?: string;
};

export type DashboardSummary = {
  statusSummary: Partial<StatusSummary>;
  recentAppointments: RecentAppointment[];
};

// 📊 Obtener el resumen para el dashboard
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("Error al obtener resumen del dashboard");
  }
  return res.json();
}
