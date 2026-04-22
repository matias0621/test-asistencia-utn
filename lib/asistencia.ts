export type AsistenciaDia = Record<string, boolean>; // dni → presente

export type AsistenciaComision = Record<string, AsistenciaDia>; // fecha (YYYY-MM-DD) → alumnos

export type AsistenciaTotal = Record<string, AsistenciaComision>; // comisionId → fechas

const STORAGE_KEY = "asistencia_data";

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
