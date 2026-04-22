export interface Alumno {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Comision {
  id: string;
  codigo: string;
  materia: string;
  curso: string;
  año: number;
  profesorLegajo: string;
  alumnos: Alumno[];
}

export interface Usuario {
  legajo: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: "profesor" | "admin";
}

export const usuarios: Usuario[] = [
  {
    legajo: "12345",
    password: "prof123",
    nombre: "Carlos",
    apellido: "García",
    rol: "profesor",
  },
  {
    legajo: "admin",
    password: "admin123",
    nombre: "Laura",
    apellido: "Martínez",
    rol: "admin",
  },
];

export const comisiones: Comision[] = [
  {
    id: "C001",
    codigo: "C001",
    materia: "Programación I",
    curso: "1K1",
    año: 2025,
    profesorLegajo: "12345",
    alumnos: [
      { dni: "40123456", nombre: "Juan", apellido: "López", email: "juan.lopez@estudiante.utn.edu.ar" },
      { dni: "40234567", nombre: "María", apellido: "Fernández", email: "maria.fernandez@estudiante.utn.edu.ar" },
      { dni: "40345678", nombre: "Pedro", apellido: "González", email: "pedro.gonzalez@estudiante.utn.edu.ar" },
      { dni: "40456789", nombre: "Lucía", apellido: "Ramírez", email: "lucia.ramirez@estudiante.utn.edu.ar" },
      { dni: "40567890", nombre: "Tomás", apellido: "Torres", email: "tomas.torres@estudiante.utn.edu.ar" },
      { dni: "40678901", nombre: "Valentina", apellido: "Sánchez", email: "valentina.sanchez@estudiante.utn.edu.ar" },
      { dni: "40789012", nombre: "Agustín", apellido: "Díaz", email: "agustin.diaz@estudiante.utn.edu.ar" },
      { dni: "40890123", nombre: "Camila", apellido: "Moreno", email: "camila.moreno@estudiante.utn.edu.ar" },
    ],
  },
  {
    id: "C002",
    codigo: "C002",
    materia: "Análisis Matemático I",
    curso: "1K2",
    año: 2025,
    profesorLegajo: "12345",
    alumnos: [
      { dni: "41123456", nombre: "Sofía", apellido: "Herrera", email: "sofia.herrera@estudiante.utn.edu.ar" },
      { dni: "41234567", nombre: "Matías", apellido: "Jiménez", email: "matias.jimenez@estudiante.utn.edu.ar" },
      { dni: "41345678", nombre: "Florencia", apellido: "Ruiz", email: "florencia.ruiz@estudiante.utn.edu.ar" },
      { dni: "41456789", nombre: "Nicolás", apellido: "Vargas", email: "nicolas.vargas@estudiante.utn.edu.ar" },
      { dni: "41567890", nombre: "Antonella", apellido: "Castro", email: "antonella.castro@estudiante.utn.edu.ar" },
      { dni: "41678901", nombre: "Ignacio", apellido: "Romero", email: "ignacio.romero@estudiante.utn.edu.ar" },
    ],
  },
  {
    id: "C003",
    codigo: "C003",
    materia: "Física I",
    curso: "1K3",
    año: 2025,
    profesorLegajo: "67890",
    alumnos: [
      { dni: "42123456", nombre: "Bruno", apellido: "Muñoz", email: "bruno.munoz@estudiante.utn.edu.ar" },
      { dni: "42234567", nombre: "Julieta", apellido: "Alvarez", email: "julieta.alvarez@estudiante.utn.edu.ar" },
      { dni: "42345678", nombre: "Ramiro", apellido: "Torres", email: "ramiro.torres@estudiante.utn.edu.ar" },
      { dni: "42456789", nombre: "Milagros", apellido: "Gutiérrez", email: "milagros.gutierrez@estudiante.utn.edu.ar" },
      { dni: "42567890", nombre: "Ezequiel", apellido: "Flores", email: "ezequiel.flores@estudiante.utn.edu.ar" },
    ],
  },
  {
    id: "C004",
    codigo: "C004",
    materia: "Química General",
    curso: "1K1",
    año: 2025,
    profesorLegajo: "12345",
    alumnos: [
      { dni: "43123456", nombre: "Ailén", apellido: "Mendoza", email: "ailen.mendoza@estudiante.utn.edu.ar" },
      { dni: "43234567", nombre: "Franco", apellido: "Reyes", email: "franco.reyes@estudiante.utn.edu.ar" },
      { dni: "43345678", nombre: "Bianca", apellido: "Ortiz", email: "bianca.ortiz@estudiante.utn.edu.ar" },
      { dni: "43456789", nombre: "Lautaro", apellido: "Navarro", email: "lautaro.navarro@estudiante.utn.edu.ar" },
      { dni: "43567890", nombre: "Celeste", apellido: "Rojas", email: "celeste.rojas@estudiante.utn.edu.ar" },
      { dni: "43678901", nombre: "Leandro", apellido: "Molina", email: "leandro.molina@estudiante.utn.edu.ar" },
      { dni: "43789012", nombre: "Pilar", apellido: "Méndez", email: "pilar.mendez@estudiante.utn.edu.ar" },
    ],
  },
];
