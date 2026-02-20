import type { Paciente } from "../types";

export const pacientesMock: Paciente[] = [
  { id: 1, nombre: "Noelia", apellido: "Delgado", email: "noelia@test.com" },
  { id: 2, nombre: "Joaquín", apellido: "Leandro", email: "joaquin@test.com" },
  { id: 3, nombre: "María", apellido: "Suárez", email: "maria@test.com" },
  { id: 4, nombre: "Tomás", apellido: "García", email: "tomas@test.com" },
];

// Para poder usarlo como si fuera la API
export function listPacientes(): Promise<Paciente[]> {
  return Promise.resolve(pacientesMock);
}
