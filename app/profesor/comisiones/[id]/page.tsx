"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { comisiones } from "@/data/db";
import {
  getAsistenciaDia,
  guardarAsistencia,
  getFechaHoy,
  getAsistenciaComision,
} from "@/lib/asistencia";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, CalendarDays, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ProfesorComisionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const comision = comisiones.find((c) => c.id === id);

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(getFechaHoy());
  const [asistencias, setAsistencias] = useState<Record<string, boolean>>({});
  const [guardado, setGuardado] = useState(false);
  const [historialFechas, setHistorialFechas] = useState<string[]>([]);

  useEffect(() => {
    if (!comision) return;
    const registros = getAsistenciaComision(comision.id);
    setHistorialFechas(Object.keys(registros).sort().reverse());
  }, [comision]);

  useEffect(() => {
    if (!comision) return;
    const registrosDia = getAsistenciaDia(comision.id, fechaSeleccionada);
    // Pre-fill with existing data or default false
    const initial: Record<string, boolean> = {};
    for (const alumno of comision.alumnos) {
      initial[alumno.dni] = registrosDia[alumno.dni] ?? false;
    }
    setAsistencias(initial);
    setGuardado(false);
  }, [comision, fechaSeleccionada]);

  function toggleAsistencia(dni: string) {
    setAsistencias((prev) => ({ ...prev, [dni]: !prev[dni] }));
    setGuardado(false);
  }

  function handleGuardar() {
    if (!comision) return;
    guardarAsistencia(comision.id, fechaSeleccionada, asistencias);
    const registros = getAsistenciaComision(comision.id);
    setHistorialFechas(Object.keys(registros).sort().reverse());
    setGuardado(true);
  }

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

  const presentes = Object.values(asistencias).filter(Boolean).length;
  const total = comision.alumnos.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/profesor/comisiones">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{comision.materia}</h1>
          <p className="text-gray-500 text-sm">
            Comisión {comision.curso} · {comision.codigo}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Selector de fecha */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              Fecha de asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Seleccioná la fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
              />
            </div>
            <Button onClick={handleGuardar} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Guardar asistencia
            </Button>
            {guardado && (
              <p className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Guardado correctamente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumen del día</CardTitle>
            <CardDescription>
              {new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{presentes}</p>
              <p className="text-xs text-gray-500 mt-0.5">Presentes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{total - presentes}</p>
              <p className="text-xs text-gray-500 mt-0.5">Ausentes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-700">{total}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total</p>
            </div>
          </CardContent>
        </Card>

        {/* Historial de fechas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Clases registradas</CardTitle>
          </CardHeader>
          <CardContent>
            {historialFechas.length === 0 ? (
              <p className="text-sm text-gray-400">Sin registros aún.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {historialFechas.map((fecha) => (
                  <button
                    key={fecha}
                    onClick={() => setFechaSeleccionada(fecha)}
                    className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                      fecha === fechaSeleccionada
                        ? "bg-blue-600 text-white"
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
      </div>

      {/* Tabla de alumnos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Lista de alumnos
          </CardTitle>
          <CardDescription>
            Marcá el checkbox para registrar la presencia de cada alumno
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16 text-center">Presente</TableHead>
                <TableHead>Apellido y Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">DNI</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="w-24 text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comision.alumnos.map((alumno) => {
                const presente = asistencias[alumno.dni] ?? false;
                return (
                  <TableRow
                    key={alumno.dni}
                    className={`cursor-pointer transition-colors ${
                      presente ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleAsistencia(alumno.dni)}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={presente}
                        onCheckedChange={() => toggleAsistencia(alumno.dni)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Asistencia de ${alumno.nombre} ${alumno.apellido}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {alumno.apellido}, {alumno.nombre}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-500 text-sm">
                      {alumno.dni}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                      {alumno.email}
                    </TableCell>
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
