// src/components/dashboard/Header.jsx
import { useState } from "react";
import { Menu, Bell, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Header({ user, onToggleSidebar }) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
<header className="w-full h-16 bg-white/60 backdrop-blur-sm border-b border-zinc-200 shadow-sm flex items-center justify-between px-4 sm:px-6 text-[--color-fg] z-50">


      {/* Toggle para móvil */}
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-[--color-fg] sm:hidden"
              onClick={() => onToggleSidebar?.()}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="p-4">Sidebar aquí</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Buscador y acciones */}
      <div className="flex items-center gap-4">
        {/* Buscador */}
        <div className="relative hidden sm:flex">
          <input
            type="text"
            placeholder="Buscar..."
            className="border border-[--color-border] rounded-lg px-3 py-1.5 text-sm text-[--color-fg] bg-[--color-bg] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
          />
        </div>

        {/* Notificaciones */}
        <Button variant="ghost" size="icon" className="text-[--color-fg] hover:bg-[--color-bg]">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Dropdown perfil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "SG")}&background=4f46e5&color=fff&size=128`}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-[--color-border]"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44 bg-white border border-[--color-border] shadow-md z-50">
            <DropdownMenuLabel className="text-sm text-[--color-muted] px-3 py-2">
              {user?.email || "Usuario"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/perfil")} className="cursor-pointer gap-2">
              <UserIcon className="w-4 h-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer gap-2 text-red-600 focus:text-red-700"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
