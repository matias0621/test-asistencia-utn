"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { comisiones, usuarios } from "@/data/db";
import { getAsistenciaComision } from "@/lib/asistencia";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CalendarDays, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminComisionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const comision = comisiones.find((c) => c.id === id);
  const historialCompleto = comision ? getAsistenciaComision(comision.id) : {};
  const fechas = Object.keys(historialCompleto).sort();

  const [fechaVista, setFechaVista] = useState<string | null>(
    fechas.length > 0 ? fechas[fechas.length - 1] : null
  );

  if (!comision) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Comisión no encontrada.</p>
        <Button variant="link" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  const profesor = usuarios.find(
    (u) => u.legajo === comision.profesorLegajo && u.rol === "profesor"
  );

  const asistenciasDia = fechaVista ? historialCompleto[fechaVista] ?? {} : {};
  const presentes = Object.values(asistenciasDia).filter(Boolean).length;

  // Calculate total attendance percentage per student across all dates
  function getPorcentajeAlumno(dni: string): number {
    if (fechas.length === 0) return 0;
    const clasesPresente = fechas.filter(
      (f) => historialCompleto[f]?.[dni] === true
    ).length;
    return Math.round((clasesPresente / fechas.length) * 100);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/comisiones">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{comision.materia}</h1>
          <p className="text-gray-500 text-sm">
            Comisión {comision.curso} · {comision.codigo}
            {profesor && ` · Prof. ${profesor.apellido}, ${profesor.nombre}`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Selector de fecha */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              Clases registradas ({fechas.length})
            </CardTitle>
            <CardDescription>Seleccioná una fecha para ver la asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            {fechas.length === 0 ? (
              <p className="text-sm text-gray-400">Sin clases registradas aún.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {[...fechas].reverse().map((fecha) => (
                  <button
                    key={fecha}
                    onClick={() => setFechaVista(fecha)}
                    className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                      fecha === fechaVista
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Resumen
            </CardTitle>
            {fechaVista && (
              <CardDescription>
                {new Date(fechaVista + "T12:00:00").toLocaleDateString("es-AR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {fechaVista ? (
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{presentes}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Presentes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">
                    {comision.alumnos.length - presentes}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Ausentes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-700">
                    {comision.alumnos.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Total</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Seleccioná una fecha.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de alumnos</CardTitle>
          <CardDescription>
            {fechaVista
              ? `Asistencia del ${new Date(fechaVista + "T12:00:00").toLocaleDateString("es-AR")}`
              : "Seleccioná una fecha para ver el detalle"}
            {fechas.length > 0 && " · La columna % muestra el promedio general de asistencia"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Apellido y Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">DNI</TableHead>
                {fechaVista && (
                  <TableHead className="w-28 text-center">
                    Estado del día
                  </TableHead>
                )}
                {fechas.length > 0 && (
                  <TableHead className="w-24 text-center">% Asistencia</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comision.alumnos.map((alumno) => {
                const presente = fechaVista
                  ? asistenciasDia[alumno.dni] === true
                  : null;
                const pct = fechas.length > 0 ? getPorcentajeAlumno(alumno.dni) : null;
                return (
                  <TableRow key={alumno.dni}>
                    <TableCell className="font-medium">
                      {alumno.apellido}, {alumno.nombre}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-500 text-sm">
                      {alumno.dni}
                    </TableCell>
                    {fechaVista && (
                      <TableCell className="text-center">
                        <Badge
                          className={
                            presente
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-50 text-red-600 hover:bg-red-50"
                          }
                          variant="secondary"
                        >
                          {presente ? "Presente" : "Ausente"}
                        </Badge>
                      </TableCell>
                    )}
                    {pct !== null && (
                      <TableCell className="text-center">
                        <span
                          className={`text-sm font-semibold ${
                            pct >= 75
                              ? "text-green-600"
                              : pct >= 50
                              ? "text-yellow-600"
                              : "text-red-500"
                          }`}
                        >
                          {pct}%
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
