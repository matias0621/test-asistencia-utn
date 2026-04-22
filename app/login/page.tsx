"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    // AuthProvider sets the user; page.tsx will redirect accordingly.
    // We can also redirect here based on the returned user.
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
            UTN
          </div>
          <CardTitle className="text-2xl">Sistema de Asistencia</CardTitle>
          <CardDescription>Ingresá con tu legajo y contraseña</CardDescription>
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
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
          </form>
          <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">Credenciales de prueba:</p>
            <p>Profe → legajo: <span className="font-mono">12345</span> / contraseña: <span className="font-mono">prof123</span></p>
            <p>Admin → legajo: <span className="font-mono">admin</span> / contraseña: <span className="font-mono">admin123</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
