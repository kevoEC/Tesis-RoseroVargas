import { useUI } from "@/hooks/useUI";
import { Suspense, lazy } from "react";

// Importa todos los componentes válidos
const modules = import.meta.glob("../../pages/**/*.{jsx,tsx}");

// Genera los componentes lazy mapeados
const routeComponents = {};
for (const path in modules) {
  const key = path
    .replace("../../pages/", "")
    .replace(/\.jsx|\.tsx$/, "")
    .toLowerCase();

  routeComponents[`/${key}`] = lazy(modules[path]);
}

export default function DashboardContent() {
  const { contentRoute } = useUI();
  const Component = routeComponents[contentRoute];

  return (
    <main className="flex-1 overflow-y-auto bg-[--color-bg] p-6 text-[--color-fg] fade-in-up scrollbar-light">
      <div className="max-w-7xl mx-auto space-y-6">
        {Component ? (
          <Suspense fallback={<div className="text-center">Cargando...</div>}>
            <Component />
          </Suspense>
        ) : (
          <div className="text-center text-red-500 text-lg font-semibold">
            ⚠️ Componente no encontrado para la ruta:{" "}
            <code className="bg-black/10 px-2 py-1 rounded">{contentRoute}</code>
            <div className="mt-4 text-sm text-zinc-500">
              Si estás desarrollando esta vista, asegúrate de crear el archivo correspondiente en <code>/pages/</code>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
