import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";

import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/auth/LoginPage";

import AgendaPage from "@/features/agenda/pages/AgendaPage";
import PacientesPage from "@/features/pacientes/pages/PacientesPage";


export default function AppRouter() {
  return (
    <Routes>
      
      <Route path="/login" element={<LoginPage />} />

     
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          
          <Route index element={<Navigate to="/agenda" replace />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/agenda" replace />} />
    </Routes>
  );
}
