import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventDropArg } from "@fullcalendar/core";

// IMPORTAMOS TUS SERVICIOS
import { listAppointments, updateAppointment } from "../services/appointments.api";

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  // 📥 Cargar turnos desde FIRESTORE
  async function cargarTurnos() {
    try {
      // Usamos la función que ya conoce Firestore
      const data = await listAppointments();

      // Mapeamos para FullCalendar
      const mapped = data.map((t) => ({
        id: t.id,
        // Usamos el nombre del paciente y la razón como título
        title: t.title || `${t.paciente_nombre} - ${t.reason}`,
        start: t.dateISO, // El formato "2026-02-16 20:00:00" es compatible
        // Si no hay endISO, FullCalendar lo calcula con la duración
        end: t.endISO || undefined, 
        extendedProps: { ...t },
      }));

      setEvents(mapped);
    } catch (err) {
      console.error("Error cargando turnos desde Firestore:", err);
    }
  }

  // 📤 Actualizar turno (Drag & Drop)
  async function moverTurno(changeInfo: EventDropArg) {
    const { id, start, end } = changeInfo.event;
    if (!start) return;

    try {
      const payload = {
        id: id,
        dateISO: start.toISOString().replace('T', ' ').substring(0, 19), // Formato SQL-like que tenés en la BD
        durationMin: end ? Math.floor((end.getTime() - start.getTime()) / 60000) : 30,
      };

      // Usamos nuestro servicio de update
      await updateAppointment(payload as any);
      
      console.log("Turno actualizado en Firestore");
    } catch (err) {
      console.error("Error moviendo turno:", err);
      alert("No se pudo actualizar el turno");
      changeInfo.revert();
    }
  }

  useEffect(() => {
    cargarTurnos();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Calendario de Turnos (Firebase)</h2>
        <button 
          onClick={cargarTurnos}
          className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          🔄 Refrescar
        </button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        editable={true}
        droppable={true}
        eventDrop={moverTurno}
        nowIndicator={true}
        locale="es"
        height="700px"
        // Ajuste para ver mejor los turnos de 30 min
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
      />
    </div>
  );
}