"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { comisiones } from "@/data/db";
import {
  getAsistenciaDia,
  guardarAsistencia,
  getFechaHoy,
  getAsistenciaComision,
  getComisionConfig,
  guardarComisionConfig,
  getFaltasPorAlumno,
  getClasesRegistradas,
  setFechaDoble,
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
import { ArrowLeft, Save, CalendarDays, CheckCircle2, Settings } from "lucide-react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";

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
  const [animatingDni, setAnimatingDni] = useState<string | null>(null);

  // Config state
  const [comisionConfig, setComisionConfig] = useState<ComisionConfig | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupClases, setSetupClases] = useState(2);
  const [setupModalidad, setSetupModalidad] = useState<"anual" | "cuatrimestral">("cuatrimestral");

  // Double attendance modal
  const [showDoubleModal, setShowDoubleModal] = useState(false);
  const [doubleChoice, setDoubleChoice] = useState<"no" | "si">("no");

  // Absence stats
  const [faltasPorAlumno, setFaltasPorAlumno] = useState<Record<string, number>>({});
  const [clasesRegistradas, setClasesRegistradas] = useState(0);

  useEffect(() => {
    if (!comision) return;
    const config = getComisionConfig(comision.id);
    if (config) {
      setComisionConfig(config);
    } else {
      setShowSetupModal(true);
    }
  }, [comision]);

  useEffect(() => {
    if (!comision) return;
    const registros = getAsistenciaComision(comision.id);
    setHistorialFechas(Object.keys(registros).sort().reverse());
  }, [comision]);

  useEffect(() => {
    if (!comision) return;
    const registrosDia = getAsistenciaDia(comision.id, fechaSeleccionada);
    const initial: Record<string, boolean> = {};
    for (const alumno of comision.alumnos) {
      initial[alumno.dni] = registrosDia[alumno.dni] ?? false;
    }
    setAsistencias(initial);
    setGuardado(false);
  }, [comision, fechaSeleccionada]);

  function refreshStats() {
    if (!comision) return;
    setFaltasPorAlumno(getFaltasPorAlumno(comision.id, comision.alumnos.map((a) => a.dni)));
    setClasesRegistradas(getClasesRegistradas(comision.id));
  }

  useEffect(() => {
    if (!comision || !comisionConfig) return;
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comision, comisionConfig, historialFechas]);

  function toggleAsistencia(dni: string) {
    setAsistencias((prev) => ({ ...prev, [dni]: !prev[dni] }));
    setGuardado(false);
    setAnimatingDni(dni);
  }

  function handleGuardar() {
    if (!comision) return;
    setDoubleChoice("no");
    setShowDoubleModal(true);
  }

  function handleConfirmarGuardar() {
    if (!comision) return;
    guardarAsistencia(comision.id, fechaSeleccionada, asistencias);
    setFechaDoble(comision.id, fechaSeleccionada, doubleChoice === "si");
    const registros = getAsistenciaComision(comision.id);
    setHistorialFechas(Object.keys(registros).sort().reverse());
    setGuardado(true);
    setShowDoubleModal(false);
    refreshStats();
  }

  function handleSetupConfirm() {
    if (!comision || setupClases < 1) return;
    const totalClases = setupClases * (setupModalidad === "cuatrimestral" ? 16 : 32);
    const config: ComisionConfig = {
      clasesSemanales: setupClases,
      modalidad: setupModalidad,
      totalClases,
      faltasPermitidas: Math.floor(totalClases * 0.25),
      asistenciasRequeridas: Math.ceil(totalClases * 0.75),
    };
    guardarComisionConfig(comision.id, config);
    setComisionConfig(config);
    setShowSetupModal(false);
  }

  // Live preview for setup modal
  const previewTotal = setupClases * (setupModalidad === "cuatrimestral" ? 16 : 32);
  const previewFaltas = Math.floor(previewTotal * 0.25);
  const previewRequeridas = Math.ceil(previewTotal * 0.75);

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
  const fechasDobles = getFechasDobles(comision.id);
  const esFechaDoble = fechasDobles.includes(fechaSeleccionada);

  return (
    <div className="space-y-6">
      {/* Setup Modal */}
      <Dialog.Root
        open={showSetupModal}
        onOpenChange={() => {}}
        modal
        disablePointerDismissal
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="h-5 w-5 text-gray-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Configuración de la comisión
              </Dialog.Title>
            </div>
            <Dialog.Description className="text-sm text-gray-500 mb-5">
              Esta información se usa para calcular el régimen de asistencia de los alumnos.
            </Dialog.Description>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="clases-semana" className="text-sm font-medium">
                  ¿Cuántas clases por semana tenés con esta comisión?
                </Label>
                <Input
                  id="clases-semana"
                  type="number"
                  min={1}
                  max={20}
                  value={setupClases}
                  onChange={(e) => setSetupClases(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24"
                />
                <p className="text-xs text-gray-400">
                  Si un día tenés 4 horas de clase con esta materia, ese día cuenta como 2 clases.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Régimen</Label>
                <RadioGroup
                  value={setupModalidad}
                  onValueChange={(v) => setSetupModalidad(v as "anual" | "cuatrimestral")}
                  className="flex gap-4"
                >
                  {(["cuatrimestral", "anual"] as const).map((op) => (
                    <label key={op} className="flex cursor-pointer items-center gap-2">
                      <Radio.Root
                        value={op}
                        className="relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input outline-none focus-visible:ring-2 focus-visible:ring-ring data-checked:border-primary"
                      >
                        <Radio.Indicator className="size-2 rounded-full bg-primary data-unchecked:hidden" />
                      </Radio.Root>
                      <span className="text-sm capitalize">{op}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm space-y-1 border border-gray-200">
                <p className="font-medium text-gray-700 mb-1">Resumen</p>
                <p className="text-gray-600">Total de clases: <span className="font-semibold text-gray-900">{previewTotal}</span></p>
                <p className="text-gray-600">Asistencias mínimas (75%): <span className="font-semibold text-gray-900">{previewRequeridas}</span></p>
                <p className="text-gray-600">Faltas permitidas (25%): <span className="font-semibold text-gray-900">{previewFaltas}</span></p>
              </div>

              <Button onClick={handleSetupConfirm} disabled={setupClases < 1} className="w-full">
                Guardar configuración
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Double attendance modal */}
      <Dialog.Root open={showDoubleModal} onOpenChange={setShowDoubleModal} modal>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-base font-semibold text-gray-900 mb-1">
              ¿Esta asistencia cuenta doble?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-5">
              Si hoy tuviste 4 horas de clase y tomaste asistencia solo una vez, marcá que cuenta doble para que se descuenten 2 faltas a quienes estuvieron ausentes.
            </Dialog.Description>

            <RadioGroup
              value={doubleChoice}
              onValueChange={(v) => setDoubleChoice(v as "no" | "si")}
              className="flex flex-col gap-3 mb-6"
            >
              {([
                { value: "no", label: "No, cuenta simple (una sola clase)" },
                { value: "si", label: "Sí, cuenta doble (equivale a 2 clases)" },
              ] as const).map((op) => (
                <label key={op.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                  <Radio.Root
                    value={op.value}
                    className="relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input outline-none focus-visible:ring-2 focus-visible:ring-ring data-checked:border-primary"
                  >
                    <Radio.Indicator className="size-2 rounded-full bg-primary data-unchecked:hidden" />
                  </Radio.Root>
                  <span className="text-sm">{op.label}</span>
                </label>
              ))}
            </RadioGroup>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDoubleModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 gap-2" onClick={handleConfirmarGuardar}>
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

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
              <CalendarDays className="h-4 w-4" style={{ color: "#B59A1B" }} />
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
            {esFechaDoble && (
              <p className="text-xs text-blue-600 font-medium">Esta fecha está registrada como clase doble.</p>
            )}
            <Button onClick={handleGuardar} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Guardar asistencia
            </Button>
            {guardado && (
              <p
                key="guardado-msg"
                className="flex items-center gap-1.5 text-sm text-green-600"
              >
                <CheckCircle2 className="h-4 w-4 animate-success-pop" />
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

        {/* Config card */}
        {comisionConfig ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Régimen de asistencia</span>
                <button
                  onClick={() => {
                    setSetupClases(comisionConfig.clasesSemanales);
                    setSetupModalidad(comisionConfig.modalidad);
                    setShowSetupModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Editar configuración"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </CardTitle>
              <CardDescription className="capitalize">
                {comisionConfig.modalidad} · {comisionConfig.clasesSemanales} clase{comisionConfig.clasesSemanales > 1 ? "s" : ""}/semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Clases totales</span>
                <span className="font-medium">{comisionConfig.totalClases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Clases dictadas</span>
                <span className="font-medium">{clasesRegistradas} / {comisionConfig.totalClases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Faltas máx. permitidas</span>
                <span className="font-medium text-red-600">{comisionConfig.faltasPermitidas}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
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
                          ? "text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={
                        fecha === fechaSeleccionada
                          ? { backgroundColor: "#003087" }
                          : undefined
                      }
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
        )}
      </div>

      {/* Historial de fechas (when config is set) */}
      {comisionConfig && historialFechas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Clases registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {historialFechas.map((fecha) => {
                const esDoble = fechasDobles.includes(fecha);
                return (
                  <button
                    key={fecha}
                    onClick={() => setFechaSeleccionada(fecha)}
                    className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                      fecha === fechaSeleccionada
                        ? "text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      fecha === fechaSeleccionada
                        ? { backgroundColor: "#003087" }
                        : undefined
                    }
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
          </CardContent>
        </Card>
      )}

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
                {comisionConfig && (
                  <TableHead className="w-36 text-center">Faltas acum.</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comision.alumnos.map((alumno) => {
                const presente = asistencias[alumno.dni] ?? false;
                const faltas = faltasPorAlumno[alumno.dni] ?? 0;
                return (
                  <TableRow
                    key={alumno.dni}
                    className={`cursor-pointer transition-colors ${
                      presente ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"
                    } ${animatingDni === alumno.dni ? "animate-row-flash" : ""}`}
                    onClick={() => toggleAsistencia(alumno.dni)}
                    onAnimationEnd={() => {
                      if (animatingDni === alumno.dni) setAnimatingDni(null);
                    }}
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
                    {comisionConfig && (
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs text-gray-600">
                            {faltas} / {comisionConfig.faltasPermitidas}
                          </span>
                          {getAusenciaBadge(faltas)}
                        </div>
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
