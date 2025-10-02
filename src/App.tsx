import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./app/Navbar";
import Dashboard from "../src/features/dashboard/pages/DashboardPage";
import PacientesPage from "../src/features/pacientes/pages/PacientesPage";
import HistorialPacientePage from "../src/features/pacientes/pages/HistorialPacientePage";
import PagosPage from "../src/features/pagos/pages/PagosPage";
import AgendaPage from "./features/agenda/pages/AgendaPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar fijo */}
        <Navbar />

        {/* Contenido principal */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pacientes" element={<PacientesPage />} />
              <Route path="/pacientes/:id/historial" element={<HistorialPacientePage />} />
              <Route path="/pagos" element={<PagosPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
