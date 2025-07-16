import { getLucideIcon } from "./getLucideIcon";

/**
 * Devuelve los permisos con íconos como componentes React.
 * Agrupa los de tipo Catálogo bajo un solo menú padre.
 */
export function mapearPermisosConIconos(permisosBackend) {
  const catalogo = {
    Menu: 999,
    Nombre: "Catálogo",
    Ruta: null,
    Icono: getLucideIcon("layers"),
    Permisos: [],
    Submenus: [],
  };

  const normales = [];

  for (const permiso of permisosBackend) {
    const icono = getLucideIcon(permiso.icono);

    if (!permiso.ruta) {
      catalogo.Permisos = permiso.permisos;
    } else if (permiso.ruta.startsWith("/catalogo")) {
      catalogo.Submenus.push({
        Submenu: permiso.menu,
        Nombre: permiso.nombre,
        Ruta: permiso.ruta,
        Permisos: permiso.permisos,
        Icono: icono,
      });
    } else {
      normales.push({
        Menu: permiso.menu,
        Nombre: permiso.nombre,
        Ruta: permiso.ruta,
        Permisos: permiso.permisos,
        Icono: icono,
      });
    }
  }

  // Solo agregar Catálogo si tiene submenús realmente
  const salida =
    catalogo.Submenus.length > 0 ? [catalogo, ...normales] : normales;
  return salida;
}
