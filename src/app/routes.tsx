import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import AgendaPage from "../features/agenda/pages/AgendaPage";
import PacientesPage from "../features/pacientes/pages/PacientesPage";
import PagosPage from "../features/pagos/pages/PagosPage";
import StockPage from "../features/stock/pages/StockPage";
import ReportesPage from "../features/reportes/pages/ReportesPage";
import PortalPacientePage from "../features/portal-paciente/pages/PortalPacientePage";
import HistorialPacientePage from "../features/pacientes/pages/HistorialPacientePage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "agenda", element: <AgendaPage /> },
      { path: "pacientes", element: <PacientesPage /> },
      { path: "pagos", element: <PagosPage /> },
      { path: "stock", element: <StockPage /> },
      { path: "reportes", element: <ReportesPage /> },
      { path: "portal-paciente", element: <PortalPacientePage /> },
      { path: "pacientes/:id/historial", element: <HistorialPacientePage />},
      
    ],
  },
]);

 