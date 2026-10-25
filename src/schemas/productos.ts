import { z } from 'astro/zod';

export const varianteSchema = z.object({
  nombre: z.string().min(1),
  precio: z.number().positive('El precio tiene que ser mayor a 0'),
  // Precio de lista para promos: se muestra tachado junto con cuánto se ahorra.
  precioAntes: z.number().positive().optional(),
}).refine((v) => !v.precioAntes || v.precioAntes > v.precio, {
  message: 'precioAntes tiene que ser mayor que el precio de promo',
  path: ['precioAntes'],
});

export const productoSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'El id va en minúsculas, números y guiones'),
    nombre: z.string().min(1),
    categoria: z.string(),
    descripcion: z.string().optional(),
    foto: z.string().optional(),
    alt: z.string().optional(),
    etiqueta: z.string().optional(),
    // Color de fondo detrás de la foto (las fotos con fondo blanco se funden con él).
    fondo: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Usá un color hex de 6 dígitos').optional(),
    // "A quién le sirve": texto de venta que se muestra al lado del producto. No es un filtro.
    paraQuien: z
      .array(z.object({ oficio: z.string().min(1), para: z.string().min(1) }))
      .max(6, 'Máximo 6 oficios por producto para que la ficha se lea de un vistazo')
      .optional(),
    disponible: z.boolean().default(true),
    variantes: z.array(varianteSchema).min(1, 'Cada producto necesita al menos un precio'),
  })
  .strict()
  .refine((p) => !p.foto || p.alt, { message: 'Si el producto tiene foto, necesita alt', path: ['alt'] });

export const productosSchema = z
  .object({
    $schema: z.string().optional(),
    // Línea arriba del catálogo, por ejemplo "Precios actualizados al 24/10".
    aviso: z.string().optional(),
    categorias: z.array(z.object({ id: z.string(), nombre: z.string() })).min(1),
    productos: z.array(productoSchema),
  })
  .strict()
  .superRefine((datos, ctx) => {
    const categorias = new Set(datos.categorias.map((c) => c.id));
    const ids = new Set<string>();
    datos.productos.forEach((p, i) => {
      if (!categorias.has(p.categoria)) {
        ctx.addIssue({
          code: 'custom',
          path: ['productos', i, 'categoria'],
          message: `La categoría "${p.categoria}" no existe en "categorias"`,
        });
      }
      if (ids.has(p.id)) {
        ctx.addIssue({ code: 'custom', path: ['productos', i, 'id'], message: `El id "${p.id}" está repetido` });
      }
      ids.add(p.id);
    });
  });

export type Producto = z.infer<typeof productoSchema>;
export type Productos = z.infer<typeof productosSchema>;
