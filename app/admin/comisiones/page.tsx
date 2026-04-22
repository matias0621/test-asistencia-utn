"use client";

import { comisiones, usuarios } from "@/data/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, User } from "lucide-react";
import Link from "next/link";

export default function AdminComisionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Todas las Comisiones</h1>
        <p className="text-gray-500 mt-1">
          Vista de administrador — {comisiones.length} comisiones registradas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comisiones.map((comision, index) => {
          const profesor = usuarios.find(
            (u) => u.legajo === comision.profesorLegajo && u.rol === "profesor"
          );
          return (
            <Link
              key={comision.id}
              href={`/admin/comisiones/${comision.id}`}
              className="block group"
            >
              <Card
                className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer group-hover:-translate-y-1 animate-card-enter"
                style={{
                  animationDelay: `${index * 0.08}s`,
                  borderTop: "3px solid #B59A1B",
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {comision.codigo}
                    </Badge>
                    <Badge
                      className="text-xs border-0 text-white"
                      style={{ backgroundColor: "#003087" }}
                    >
                      {comision.año}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight mt-2">
                    {comision.materia}
                  </CardTitle>
                  <CardDescription>Comisión {comision.curso}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{comision.alumnos.length} alumnos</span>
                  </div>
                  {profesor && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>
                        Prof. {profesor.apellido}, {profesor.nombre}
                      </span>
                    </div>
                  )}
                  {!profesor && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="h-4 w-4" />
                      <span>Legajo: {comision.profesorLegajo}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
