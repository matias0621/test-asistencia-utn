"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { comisiones, usuarios } from "@/data/db";
import {
  getAsistenciaComision,
  getComisionConfig,
  getFaltasPorAlumno,
  getClasesRegistradas,
  getFechasDobles,
  type ComisionConfig,
} from "@/lib/asistencia";
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
import { ArrowLeft, CalendarDays, BarChart3, Settings, Search, X } from "lucide-react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import type { Alumno } from "@/data/db";

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
  const comisionConfig: ComisionConfig | null = comision ? getComisionConfig(comision.id) : null;
  const fechasDobles = comision ? getFechasDobles(comision.id) : [];
  const faltasPorAlumno = comision
    ? getFaltasPorAlumno(comision.id, comision.alumnos.map((a) => a.dni))
    : {};
  const clasesRegistradas = comision ? getClasesRegistradas(comision.id) : 0;

  const [fechaVista, setFechaVista] = useState<string | null>(
    fechas.length > 0 ? fechas[fechas.length - 1] : null
  );
  const [busqueda, setBusqueda] = useState("");
  const [alumnoDetalle, setAlumnoDetalle] = useState<Alumno | null>(null);

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

  // Weighted attendance percentage (double dates count as 2 classes)
  function getPorcentajeAlumno(dni: string): number {
    if (clasesRegistradas === 0) return 0;
    let clasesPresente = 0;
    for (const f of fechas) {
      if (historialCompleto[f]?.[dni] === true) {
        clasesPresente += fechasDobles.includes(f) ? 2 : 1;
      }
    }
    return Math.round((clasesPresente / clasesRegistradas) * 100);
  }

  function getAusenciaBadge(faltas: number) {
    if (!comisionConfig) return null;
    const { faltasPermitidas } = comisionConfig;
    if (faltas >= faltasPermitidas) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs" variant="secondary">Irregular</Badge>;
    }
    if (faltas >= faltasPermitidas - 1) {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs" variant="secondary">En riesgo</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs" variant="secondary">Regular</Badge>;
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

      {/* Regime config card */}
      {comisionConfig && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-600" />
              Régimen de asistencia
            </CardTitle>
            <CardDescription className="capitalize">
              {comisionConfig.modalidad} · {comisionConfig.clasesSemanales} clase{comisionConfig.clasesSemanales > 1 ? "s" : ""}/semana
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-gray-500">Clases totales</p>
              <p className="text-xl font-bold text-gray-900">{comisionConfig.totalClases}</p>
            </div>
            <div>
              <p className="text-gray-500">Clases dictadas</p>
              <p className="text-xl font-bold text-gray-900">{clasesRegistradas} / {comisionConfig.totalClases}</p>
            </div>
            <div>
              <p className="text-gray-500">Faltas máx. permitidas</p>
              <p className="text-xl font-bold text-red-600">{comisionConfig.faltasPermitidas}</p>
            </div>
            <div>
              <p className="text-gray-500">Asistencia mínima</p>
              <p className="text-xl font-bold text-gray-900">{comisionConfig.asistenciasRequeridas} clases</p>
            </div>
          </CardContent>
        </Card>
      )}

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
                {[...fechas].reverse().map((fecha) => {
                  const esDoble = fechasDobles.includes(fecha);
                  return (
                    <button
                      key={fecha}
                      onClick={() => setFechaVista(fecha)}
                      className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                        fecha === fechaVista
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={esDoble ? "Clase doble" : undefined}
                    >
                      {new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                      {esDoble && <span className="ml-1 opacity-80">×2</span>}
                    </button>
                  );
                })}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Lista de alumnos</CardTitle>
              <CardDescription>
                {fechaVista
                  ? `Asistencia del ${new Date(fechaVista + "T12:00:00").toLocaleDateString("es-AR")}`
                  : "Seleccioná una fecha para ver el detalle"}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Detalle modal */}
          <Dialog.Root
            open={alumnoDetalle !== null}
            onOpenChange={(open) => { if (!open) setAlumnoDetalle(null); }}
            modal
          >
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
              <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
                {alumnoDetalle && (() => {
                  const faltas = faltasPorAlumno[alumnoDetalle.dni] ?? 0;
                  const pct = clasesRegistradas > 0 ? getPorcentajeAlumno(alumnoDetalle.dni) : null;
                  const presente = fechaVista ? asistenciasDia[alumnoDetalle.dni] === true : null;
                  return (
                    <>
                      <Dialog.Title className="text-base font-semibold text-gray-900 mb-0.5">
                        {alumnoDetalle.apellido}, {alumnoDetalle.nombre}
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-gray-500 mb-5">
                        DNI {alumnoDetalle.dni} · {alumnoDetalle.email}
                      </Dialog.Description>

                      <div className="space-y-3">
                        {presente !== null && (
                          <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                            <span className="text-sm text-gray-600">Estado del día</span>
                            <Badge
                              className={presente
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-600 hover:bg-red-50"}
                              variant="secondary"
                            >
                              {presente ? "Presente" : "Ausente"}
                            </Badge>
                          </div>
                        )}
                        {pct !== null && (
                          <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                            <span className="text-sm text-gray-600">% Asistencia general</span>
                            <span className={`text-sm font-semibold ${pct >= 75 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                              {pct}%
                            </span>
                          </div>
                        )}
                        {comisionConfig && (
                          <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                            <span className="text-sm text-gray-600">Faltas acumuladas</span>
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-sm font-medium text-gray-800">
                                {faltas} / {comisionConfig.faltasPermitidas}
                              </span>
                              {getAusenciaBadge(faltas)}
                            </div>
                          </div>
                        )}
                        {comisionConfig && (
                          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm space-y-1">
                            <p className="text-gray-500">
                              Le quedan <span className="font-semibold text-gray-900">{Math.max(0, comisionConfig.faltasPermitidas - faltas)}</span> faltas antes de quedar irregular.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5">
                        <Dialog.Close
                          render={<Button variant="outline" className="w-full">Cerrar</Button>}
                        />
                      </div>
                    </>
                  );
                })()}
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Apellido y Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">DNI</TableHead>
                <TableHead className="hidden md:table-cell w-36">Última asistencia</TableHead>
                <TableHead className="w-28 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comision.alumnos
                .filter((alumno) => {
                  const q = busqueda.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    alumno.nombre.toLowerCase().includes(q) ||
                    alumno.apellido.toLowerCase().includes(q) ||
                    alumno.dni.includes(q)
                  );
                })
                .map((alumno) => (
                  <TableRow key={alumno.dni} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {alumno.apellido}, {alumno.nombre}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-500 text-sm">
                      {alumno.dni}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-500">
                      {(() => {
                        const ultima = fechas.filter((f) => historialCompleto[f]?.[alumno.dni] === true).at(-1);
                        if (!ultima) return <span className="text-gray-400">Sin asistencias</span>;
                        return new Date(ultima + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAlumnoDetalle(alumno)}
                      >
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {comision.alumnos.filter((alumno) => {
                const q = busqueda.toLowerCase().trim();
                if (!q) return false;
                return !(
                  alumno.nombre.toLowerCase().includes(q) ||
                  alumno.apellido.toLowerCase().includes(q) ||
                  alumno.dni.includes(q)
                );
              }).length === comision.alumnos.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-400 py-8">
                    No se encontraron alumnos con ese criterio.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
