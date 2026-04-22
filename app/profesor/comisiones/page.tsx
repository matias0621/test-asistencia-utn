"use client";

import { useAuth } from "@/components/auth-provider";
import { comisiones } from "@/data/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users } from "lucide-react";
import Link from "next/link";

export default function ProfesorComisionesPage() {
  const { usuario } = useAuth();

  const misComisiones = comisiones.filter(
    (c) => c.profesorLegajo === usuario?.legajo
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Comisiones</h1>
        <p className="text-gray-500 mt-1">
          Seleccioná una comisión para tomar asistencia
        </p>
      </div>

      {misComisiones.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500">No tenés comisiones asignadas.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {misComisiones.map((comision) => (
            <Link
              key={comision.id}
              href={`/profesor/comisiones/${comision.id}`}
              className="block group"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-blue-300 cursor-pointer group-hover:-translate-y-0.5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {comision.codigo}
                    </Badge>
                    <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {comision.año}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight mt-2">
                    {comision.materia}
                  </CardTitle>
                  <CardDescription>Comisión {comision.curso}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{comision.alumnos.length} alumnos</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
