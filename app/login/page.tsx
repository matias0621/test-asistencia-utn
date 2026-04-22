"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const [legajo, setLegajo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const ok = login(legajo.trim(), password);
    if (!ok) {
      setError("Legajo o contraseña incorrectos.");
      return;
    }
    const stored = localStorage.getItem("usuario_sesion");
    if (stored) {
      const u = JSON.parse(stored);
      if (u.rol === "admin") {
        router.push("/admin/comisiones");
      } else {
        router.push("/profesor/comisiones");
      }
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #001d54 0%, #003087 55%, #0a4aaa 100%)",
      }}
    >
      {/* Subtle decorative background circles */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-10"
          style={{ backgroundColor: "#B59A1B" }}
        />
        <div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-10"
          style={{ backgroundColor: "#B59A1B" }}
        />
      </div>

      <Card className="w-full max-w-md shadow-2xl animate-card-enter">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto">
            <Image
              src="/logo-utn-progra.jpg"
              alt="UTN Programación"
              width={72}
              height={72}
              className="rounded-full mx-auto"
              style={{ border: "3px solid #B59A1B", boxShadow: "0 4px 16px rgba(181,154,27,0.35)" }}
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sistema de Asistencia
            </CardTitle>
            <CardDescription className="mt-1 font-medium" style={{ color: "#003087" }}>
              Universidad Tecnológica Nacional
            </CardDescription>
          </div>
          <p className="text-sm text-gray-500">Ingresá con tu legajo y contraseña</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legajo">Legajo</Label>
              <Input
                id="legajo"
                type="text"
                placeholder="Ej: 12345"
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full font-semibold tracking-wide">
              Iniciar sesión
            </Button>
          </form>
          <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600">Credenciales de prueba:</p>
            <p>
              Profe → legajo: <span className="font-mono bg-gray-200 px-1 rounded">12345</span> /
              contraseña: <span className="font-mono bg-gray-200 px-1 rounded">prof123</span>
            </p>
            <p>
              Admin → legajo: <span className="font-mono bg-gray-200 px-1 rounded">admin</span> /
              contraseña: <span className="font-mono bg-gray-200 px-1 rounded">admin123</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
