export interface Paciente {
  id: string;               
  nombre: string;
  apellido: string;
  email?: string;

  // Opcionales
  dni?: string;
  telefono?: string;
  fechaAlta?: string;

  // Campos usados en PacienteForm
  fechaNacimiento?: string;
  obraSocial?: string;
  numeroAfiliado?: string;
  notas?: string;
  activo?: boolean;
}

// Usamos PacienteInput para crear/editar pacientes (sin id)
export type PacienteInput = Omit<Paciente, "id">;
