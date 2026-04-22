"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usuarios, type Usuario } from "@/data/db";

interface AuthContextValue {
  usuario: Omit<Usuario, "password"> | null;
  login: (legajo: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Omit<Usuario, "password"> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario_sesion");
    if (stored) {
      try {
        setUsuario(JSON.parse(stored));
      } catch {
        localStorage.removeItem("usuario_sesion");
      }
    }
  }, []);

  function login(legajo: string, password: string): boolean {
    const encontrado = usuarios.find(
      (u) => u.legajo === legajo && u.password === password
    );
    if (!encontrado) return false;

    const { password: _, ...sinPassword } = encontrado;
    setUsuario(sinPassword);
    localStorage.setItem("usuario_sesion", JSON.stringify(sinPassword));
    return true;
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem("usuario_sesion");
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
