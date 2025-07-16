// src/contexts/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { loginRequest } from "@/service/Seguridad/authService";
import { mapearPermisosConIconos } from "@/utils/mapPermisos";

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      const permisos = Array.isArray(parsed.permisos) ? parsed.permisos : [];
      const dataConIconos = {
        ...parsed,
        permisos: mapearPermisosConIconos(permisos),
      };
      setAuthData(dataConIconos);
    }
    setIsLoading(false); // <- Esto siempre debe ejecutarse!
  }, []);

  const isAuthenticated = !!authData?.token;

  const login = async (email, contraseña) => {
    const data = await loginRequest(email, contraseña);
    localStorage.setItem("user", JSON.stringify(data));
    const permisosTransformados = mapearPermisosConIconos(data.permisos);
    const fullUser = { ...data, permisos: permisosTransformados };
    setAuthData(fullUser);
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user: authData?.usuario || null,
        token: authData?.token || null,
        roles: authData?.roles || [],
        permisos: authData?.permisos || [],
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
