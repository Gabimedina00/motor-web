// Carga y valida los datos del cliente activo (variable CLIENT, por defecto _ejemplo).
// Si algo está mal, el build se corta con un mensaje que dice qué archivo y qué campo arreglar.
import fs from 'node:fs';
import path from 'node:path';
import type { ImageMetadata } from 'astro';
import type { z } from 'astro/zod';
import { siteSchema, type Site } from '../schemas/site';
import { productosSchema, type Productos } from '../schemas/productos';
import { ubicacionesSchema, type Ubicaciones } from '../schemas/ubicaciones';

export const CLIENTE = process.env.CLIENT || '_ejemplo';
const carpeta = path.join(process.cwd(), 'clients', CLIENTE);

const fotos = import.meta.glob<ImageMetadata>('/clients/*/fotos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});
const paginas = import.meta.glob<{ Content: unknown }>('/clients/*/paginas/*.md', { eager: true });

function leer<T>(archivo: string, schema: z.ZodType<T>, opcional = false): T | undefined {
  const ruta = path.join(carpeta, archivo);
  if (!fs.existsSync(ruta)) {
    if (opcional) return undefined;
    throw new Error(`[motor-web] Falta clients/${CLIENTE}/${archivo}`);
  }
  let json: unknown;
  try {
    json = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch (e) {
    throw new Error(`[motor-web] clients/${CLIENTE}/${archivo} no es un JSON válido: ${(e as Error).message}`);
  }
  const resultado = schema.safeParse(json);
  if (!resultado.success) {
    const errores = resultado.error.issues.map((i) => `  - ${i.path.join('.') || '(raíz)'}: ${i.message}`);
    throw new Error(`[motor-web] Revisá clients/${CLIENTE}/${archivo}:\n${errores.join('\n')}`);
  }
  return resultado.data;
}

export function foto(nombre: string): ImageMetadata {
  const imagen = fotos[`/clients/${CLIENTE}/fotos/${nombre}`];
  if (!imagen) throw new Error(`[motor-web] No existe la foto clients/${CLIENTE}/fotos/${nombre}`);
  return imagen;
}

export function pagina(nombre: string) {
  return paginas[`/clients/${CLIENTE}/paginas/${nombre}.md`]?.Content as
    | ((props: Record<string, unknown>) => unknown)
    | undefined;
}

export const site: Site = leer('site.json', siteSchema)!;
export const productos: Productos | undefined = leer('productos.json', productosSchema, true);
export const ubicaciones: Ubicaciones | undefined = leer('ubicaciones.json', ubicacionesSchema, true);

// Valida que existan todas las fotos referenciadas antes de empezar a renderizar.
[
  site.hero.foto,
  site.marca.logo?.foto,
  ...(site.galeria ?? []).map((g) => g.foto),
  ...(productos?.productos ?? []).map((p) => p.foto),
]
  .filter((f): f is string => Boolean(f))
  .forEach(foto);
