import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import Spinner from "@/components/ui/loader";
import ProtectedRoute from "@/routes/ProtectedRoute"; // ← usa el path real donde lo tengas
import DashboardLayout from "@/layout/DashboardLayout";
import {
  publicRoutes,
  protectedRoutes,
  fallbackRoutes,
} from "@/routes/AppRoutes";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#4f46e5", // Gris oscuro (Tailwind gray-800)
            color: "white",
            fontSize: "0.8rem",
            padding: "1rem 1.25rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            opacity: 0.75,
          },
        }}
      />
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* Redirección base */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rutas públicas */}
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* Rutas protegidas con layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                {protectedRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Route>
            </Route>

            {/* Rutas fallback */}
            {fallbackRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
