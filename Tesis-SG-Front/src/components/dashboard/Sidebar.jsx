import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/contexts/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { permisos, isLoading } = useContext(AuthContext);

  const [openMenus, setOpenMenus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🟢 Detecta y abre el menú/submenú padre automáticamente si la ruta coincide
  useEffect(() => {
    setSidebarOpen(false);

    const newOpenMenus = {};
    permisos.forEach((menu) => {
      // Si la ruta activa es la del menú principal, no es submenú, pero igual lo puedes abrir si quieres
      if (menu.Ruta === location.pathname) {
        newOpenMenus[menu.Menu] = false; // No abrir submenús
      }
      // Si la ruta activa es la de algún submenú, abrir el padre
      if (
        menu.Submenus &&
        menu.Submenus.some((sub) => sub.Ruta === location.pathname)
      ) {
        newOpenMenus[menu.Menu] = true;
      }
    });
    setOpenMenus(newOpenMenus);
  }, [location.pathname, permisos]);

  if (isLoading) return null;

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleNavigation = (ruta) => {
    navigate(ruta);
  };

  const activePath = location.pathname;

  // Render del menú principal (compartido desktop/mobile)
  const renderMenus = () => (
    <nav className="space-y-2">
      {permisos.map((menu) => {
        // Oculta Catálogo si no tiene submenús
        if ((menu.Nombre === "Catálogo" || menu.Menu === 999) && (!menu.Submenus || menu.Submenus.length === 0)) {
          return null;
        }
        const Icon = menu.Icono;
        return (
          <div key={menu.Menu}>
            <button
              onClick={() => {
                if (menu.Submenus && menu.Submenus.length > 0) toggleMenu(menu.Menu);
                else if (menu.Ruta) handleNavigation(menu.Ruta);
              }}
              className={cn(
                "flex items-center justify-between w-full text-left px-4 py-3 rounded-md transition-all duration-200 group",
                activePath === menu.Ruta
                  ? "bg-white/10 text-white font-semibold shadow-inner"
                  : "hover:bg-white/5 text-white/80"
              )}
            >
              <span className="flex items-center gap-3">
                {Icon && <Icon size={18} />}
                {menu.Nombre}
              </span>
              {menu.Submenus && menu.Submenus.length > 0 && (
                <span className="transition-transform duration-200">
                  {openMenus[menu.Menu] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </button>
            {/* Submenús */}
            {menu.Submenus && menu.Submenus.length > 0 && openMenus[menu.Menu] && (
              <div className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-3">
                {menu.Submenus.map((sub) => {
                  const SubIcon = sub.Icono;
                  return (
                    <button
                      key={sub.Submenu}
                      onClick={() => handleNavigation(sub.Ruta)}
                      className={cn(
                        "flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200",
                        activePath === sub.Ruta
                          ? "bg-white/10 text-white font-medium shadow-inner"
                          : "text-white/70 hover:bg-white/5"
                      )}
                    >
                      {SubIcon && <SubIcon size={16} />}
                      {sub.Nombre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 min-w-[16rem] bg-[#2e268e] text-white hidden md:flex flex-col">
        <div className="flex items-center justify-center p-6">
          <img src="/png/Logo SG 5.png" alt="SG Consulting Group" className="h-10" />
        </div>
        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-[calc(100vh-6rem)]">
          {renderMenus()}
        </div>
      </aside>

      {/* Mobile header: botón de menú */}
      <div className="fixed top-0 left-0 w-full flex md:hidden items-center justify-between bg-[#2e268e] z-50 h-14 px-4 shadow">
        <img src="/png/Logo SG 5.png" alt="SG Consulting Group" className="h-8" />
        <button
          aria-label="Abrir menú"
          onClick={() => setSidebarOpen(true)}
          className="text-white"
        >
          <MenuIcon size={32} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black bg-opacity-30 transition-opacity duration-200",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-[#2e268e] text-white z-[100] flex flex-col transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ boxShadow: sidebarOpen ? "2px 0 16px #0006" : undefined }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <img src="/png/Logo SG 5.png" alt="SG Consulting Group" className="h-8" />
          <button
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
            className="text-white"
          >
            <CloseIcon size={28} />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {renderMenus()}
        </div>
      </aside>
    </>
  );
}
