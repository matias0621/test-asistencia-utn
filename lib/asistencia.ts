export type AsistenciaDia = Record<string, boolean>; // dni → presente

export type AsistenciaComision = Record<string, AsistenciaDia>; // fecha (YYYY-MM-DD) → alumnos

export type AsistenciaTotal = Record<string, AsistenciaComision>; // comisionId → fechas

export interface ComisionConfig {
  clasesSemanales: number;
  modalidad: "anual" | "cuatrimestral";
  totalClases: number;
  faltasPermitidas: number;
  asistenciasRequeridas: number;
}

const STORAGE_KEY = "asistencia_data";
const CONFIG_KEY = "comision_config";
const FECHAS_DOBLES_KEY = "asistencia_fechas_dobles";

export function getAsistencia(): AsistenciaTotal {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AsistenciaTotal) : {};
  } catch {
    return {};
  }
}

export function guardarAsistencia(
  comisionId: string,
  fecha: string,
  asistencias: Record<string, boolean>
): void {
  const total = getAsistencia();
  if (!total[comisionId]) total[comisionId] = {};
  total[comisionId][fecha] = asistencias;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(total));
}

export function getAsistenciaComision(comisionId: string): AsistenciaComision {
  return getAsistencia()[comisionId] ?? {};
}

export function getAsistenciaDia(
  comisionId: string,
  fecha: string
): AsistenciaDia {
  return getAsistenciaComision(comisionId)[fecha] ?? {};
}

export function getFechaHoy(): string {
  return new Date().toISOString().split("T")[0];
}

// --- Comision config ---

export function getComisionConfig(comisionId: string): ComisionConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, ComisionConfig>;
    return all[comisionId] ?? null;
  } catch {
    return null;
  }
}

export function guardarComisionConfig(comisionId: string, config: ComisionConfig): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(CONFIG_KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, ComisionConfig>) : {};
  all[comisionId] = config;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(all));
}

// --- Fechas dobles ---

export function getFechasDobles(comisionId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FECHAS_DOBLES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, string[]>;
    return all[comisionId] ?? [];
  } catch {
    return [];
  }
}

export function setFechaDoble(comisionId: string, fecha: string, esDoble: boolean): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(FECHAS_DOBLES_KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  if (!all[comisionId]) all[comisionId] = [];
  if (esDoble) {
    if (!all[comisionId].includes(fecha)) all[comisionId].push(fecha);
  } else {
    all[comisionId] = all[comisionId].filter((f) => f !== fecha);
  }
  localStorage.setItem(FECHAS_DOBLES_KEY, JSON.stringify(all));
}

// --- Stats ---

export function getFaltasPorAlumno(
  comisionId: string,
  dnis: string[]
): Record<string, number> {
  const registros = getAsistenciaComision(comisionId);
  const fechasDobles = getFechasDobles(comisionId);
  const faltas: Record<string, number> = {};
  for (const dni of dnis) faltas[dni] = 0;
  for (const [fecha, dia] of Object.entries(registros)) {
    const peso = fechasDobles.includes(fecha) ? 2 : 1;
    for (const dni of dnis) {
      if (!dia[dni]) faltas[dni] += peso;
    }
  }
  return faltas;
}

export function getClasesRegistradas(comisionId: string): number {
  const registros = getAsistenciaComision(comisionId);
  const fechasDobles = getFechasDobles(comisionId);
  let total = 0;
  for (const fecha of Object.keys(registros)) {
    total += fechasDobles.includes(fecha) ? 2 : 1;
  }
  return total;
}
