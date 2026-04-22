"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!usuario) return null;

  return (
    <header className="sticky top-0 z-50 w-full shadow-md" style={{ backgroundColor: "#003087" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image
              src="/logo-utn-progra.jpg"
              alt="UTN Programación"
              width={40}
              height={40}
              className="rounded-full"
              style={{ border: "2px solid #B59A1B" }}
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">
              Sistema de Asistencia
            </p>
            <p className="text-xs leading-tight" style={{ color: "#a8bfe8" }}>
              Universidad Tecnológica Nacional
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" style={{ color: "#a8bfe8" }} />
            <span className="text-sm text-white hidden sm:inline">
              {usuario.nombre} {usuario.apellido}
            </span>
            <Badge
              className="text-xs text-white border-0"
              style={
                usuario.rol === "admin"
                  ? { backgroundColor: "#B59A1B" }
                  : { backgroundColor: "rgba(255,255,255,0.2)" }
              }
            >
              {usuario.rol === "admin" ? "Administrador" : "Profesor"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-white hover:bg-white/20 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
