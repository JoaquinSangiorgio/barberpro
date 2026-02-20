// src/main.tsx
import "../index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import LoginPage from "../auth/LoginPage";

import AppLayout from "../layouts/AppLayout";
import Dashboard from "../features/dashboard/pages/DashboardPage";
import AgendaPage from "../features/agenda/pages/AgendaPage";
import PacientesPage from "../features/pacientes/pages/PacientesPage";
import HistorialPacientePage from "../features/pacientes/pages/HistorialPacientePage";
import PagosPage from "../features/pagos/pages/PagosPage";
import StockPage from "@/features/stock/pages/StockPage";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protegido: todo lo demás */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/pacientes/:id/historial" element={<HistorialPacientePage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/stock" element={<StockPage/>} />
          </Route>
        </Route>

        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
