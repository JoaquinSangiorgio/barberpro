import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventDropArg } from "@fullcalendar/core";

const API_URL = "https://sparkx.com.ar/api";

interface Turno {
  id: string;
  title: string;
  dateISO: string;
  endISO: string;
  description: string;
}

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  // 📥 Cargar turnos desde el backend
  async function cargarTurnos() {
    try {
      const res = await fetch(`${API_URL}/appointments.php`);
      const data: Turno[] = await res.json();

      const mapped = data.map((t) => ({
        id: t.id,
        title: t.title,
        start: t.dateISO,
        end: t.endISO,
        description: t.description,
      }));

      setEvents(mapped);
    } catch (err) {
      console.error("Error cargando turnos:", err);
    }
  }

  // 📤 Actualizar turno cuando se arrastra en el calendario
  async function moverTurno(changeInfo: EventDropArg) {
    const { id, start, end } = changeInfo.event;
    if (!start || !end) return;

    try {
      const payload = {
        dateISO: start.toISOString(),
        durationMin: Math.floor((end.getTime() - start.getTime()) / 60000),
      };

      const res = await fetch(`${API_URL}/appointments.php?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.status !== "updated") {
        alert("Error actualizando turno");
        changeInfo.revert(); // ❌ Vuelve atrás si falla
      }
    } catch (err) {
      console.error("Error moviendo turno:", err);
      changeInfo.revert();
    }
  }

  useEffect(() => {
    cargarTurnos();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Calendario de Turnos</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        editable={true}        // ✅ permite drag & drop
        droppable={true}
        eventDrop={moverTurno} // ✅ cuando se arrastra
        nowIndicator={true}
        locale="es"
        height="700px"
      />
    </div>
  );
}
