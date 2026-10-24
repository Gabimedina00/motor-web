import { z } from 'astro/zod';

export const varianteSchema = z.object({
  nombre: z.string().min(1),
  precio: z.number().positive('El precio tiene que ser mayor a 0'),
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
    disponible: z.boolean().default(true),
    variantes: z.array(varianteSchema).min(1, 'Cada producto necesita al menos un precio'),
  })
  .strict()
  .refine((p) => !p.foto || p.alt, { message: 'Si el producto tiene foto, necesita alt', path: ['alt'] });

export const productosSchema = z
  .object({
    $schema: z.string().optional(),
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
