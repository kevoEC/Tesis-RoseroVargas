import { useContext } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { Outlet } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";

export default function DashboardLayout() {
  const { isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-bg] text-[--color-fg]">
        <span className="text-sm text-muted">Cargando sesión...</span>
      </div>
    );
  }

  return (
<div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#f8f9fb] to-[#eceff4] text-[--color-fg]">

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Header />

        {/* Contenedor de contenido scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-light bg-pattern">
          <div className="max-w-7xl mx-auto w-full bg-white rounded-xl shadow-md p-6 border border-zinc-200">
            <Outlet />
          </div>
        </div>

        <DashboardFooter />
      </div>
    </div>
  );
}
