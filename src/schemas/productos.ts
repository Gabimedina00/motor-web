import { z } from 'astro/zod';

export const varianteSchema = z.object({
  nombre: z.string().min(1),
  precio: z.number().positive('El precio tiene que ser mayor a 0'),
  // Precio de lista para promos: se muestra tachado junto con cuánto se ahorra.
  precioAntes: z.number().positive().optional(),
  // Cuántas unidades trae esta presentación (por ejemplo 3 cajas). Con 2 o más, el cliente
  // puede combinar colores y talles dentro del pack. Necesita "opciones.unidad".
  unidades: z.number().int().positive().optional(),
}).refine((v) => !v.precioAntes || v.precioAntes > v.precio, {
  message: 'precioAntes tiene que ser mayor que el precio de promo',
  path: ['precioAntes'],
});

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Usá un color hex de 6 dígitos');

// Lo que el cliente elige además de la presentación: color, talle o los dos.
export const opcionesSchema = z
  .object({
    // "muestra" es el color del circulito; el nombre siempre se ve escrito al lado.
    // "talles" dentro de un color: los que hay en ese color (los demás se ven deshabilitados).
    colores: z
      .array(z.object({ nombre: z.string().min(1), muestra: hex, talles: z.array(z.string().min(1)).min(1).optional() }).strict())
      .min(1)
      .optional(),
    // Talles iguales para todo el producto (por ejemplo un combo con guantes).
    talles: z.array(z.string().min(1)).min(1).optional(),
    // Cómo se llama lo que se cuenta: "caja" / "cajas". Se usa en "1 pack de 3 cajas".
    unidad: z.object({ singular: z.string().min(1), plural: z.string().min(1) }).strict().optional(),
  })
  .strict()
  .refine((o) => o.colores || o.talles || o.unidad, { message: 'Cargá "colores", "talles" o "unidad"' })
  .refine((o) => !(o.talles && o.colores?.some((c) => c.talles)), {
    message: 'Poné los talles en cada color o en "talles", no en los dos lugares',
    path: ['talles'],
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
    // Color de fondo del recuadro de la foto (se ve si la foto no llena el recuadro).
    fondo: hex.optional(),
    // "Ideal para: manicura · pestañas · estética". Texto de venta, no es un filtro.
    idealPara: z
      .array(z.string().min(1))
      .max(4, 'Máximo 4 rubros por producto para que la ficha se lea de un vistazo')
      .optional(),
    disponible: z.boolean().default(true),
    opciones: opcionesSchema.optional(),
    variantes: z.array(varianteSchema).min(1, 'Cada producto necesita al menos un precio'),
  })
  .strict()
  .refine((p) => !p.foto || p.alt, { message: 'Si el producto tiene foto, necesita alt', path: ['alt'] })
  .refine((p) => !p.variantes.some((v) => v.unidades) || p.opciones?.unidad, {
    message: 'Si una presentación tiene "unidades", cargá "opciones.unidad" (por ejemplo caja / cajas)',
    path: ['opciones', 'unidad'],
  });

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
export type Opciones = z.infer<typeof opcionesSchema>;
export type Productos = z.infer<typeof productosSchema>;
