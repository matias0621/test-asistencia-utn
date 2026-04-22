"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap } from "lucide-react";

export function Navbar() {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!usuario) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
            UTN
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Sistema de Asistencia</p>
            <p className="text-xs text-gray-500">Universidad Tecnológica Nacional</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {usuario.nombre} {usuario.apellido}
            </span>
            <Badge variant={usuario.rol === "admin" ? "default" : "secondary"}>
              {usuario.rol === "admin" ? "Administrador" : "Profesor"}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
