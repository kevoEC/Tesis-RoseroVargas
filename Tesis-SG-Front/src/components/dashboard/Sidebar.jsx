import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { permisos, isLoading } = useContext(AuthContext);

  const [openMenus, setOpenMenus] = useState({});
  const [activePath, setActivePath] = useState(location.pathname);

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleNavigation = (ruta) => {
    navigate(ruta);
  };

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  if (isLoading) return null;

  return (
    <aside className="w-64 min-w-[16rem] bg-[#2e268e] text-white hidden md:flex flex-col">
      <div className="flex items-center justify-center p-6">
        <img src="/png/Logo SG 5.png" alt="SG Consulting Group" className="h-10" />
      </div>

      <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-[calc(100vh-6rem)]">
        <nav className="space-y-2">
          {permisos.map((menu) => {
            const Icon = menu.Icono;
            return (
              <div key={menu.Menu}>
                <button
                  onClick={() => {
                    if (menu.Submenus) toggleMenu(menu.Menu);
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
                  {menu.Submenus && (
                    <span className="transition-transform duration-200">
                      {openMenus[menu.Menu] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                </button>

                {/* Submenús con animación */}
                {menu.Submenus && (
                  <AnimatePresence initial={false}>
                    {openMenus[menu.Menu] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-3 overflow-hidden"
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
