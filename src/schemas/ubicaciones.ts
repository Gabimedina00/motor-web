import { z } from 'astro/zod';

export const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const;
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora en formato HH:MM, por ejemplo 09:30');

export const horarioSchema = z.object({
  dias: z.array(z.enum(DIAS)).min(1),
  abre: hora,
  cierra: hora,
});

export const ubicacionesSchema = z
  .object({
    $schema: z.string().optional(),
    ubicaciones: z.array(
      z
        .object({
          id: z.string(),
          nombre: z.string(),
          direccion: z.string(),
          ciudad: z.string(),
          mapa: z.url().optional(),
          telefono: z.string().optional(),
          horarios: z.array(horarioSchema).min(1),
        })
        .strict(),
    ),
    zonasEnvio: z.array(z.string()).optional(),
  })
  .strict();

export type Dia = (typeof DIAS)[number];
export type Horario = z.infer<typeof horarioSchema>;
export type Ubicaciones = z.infer<typeof ubicacionesSchema>;
