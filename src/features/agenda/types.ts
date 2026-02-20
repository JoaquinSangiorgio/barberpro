export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "no_show"
  | "cancelled";

export type Appointment = {
  id: string;              
  title: string;
  patientId: string;
  patientName?: string;        
  professional: string;
  reason?: string;
  dateISO: string;   
  durationMin: number;  
  status: AppointmentStatus;
  isUrgent?: boolean;
  notes?: string;
  location?: string;     
};

export type Range = "day" | "week" | "month";
