// Genera schemas/*.schema.json desde los esquemas zod, para que el editor autocomplete los JSON de cada cliente.
// Uso: npm run esquemas
import fs from 'node:fs';
import { z } from 'astro/zod';
import { siteSchema } from '../src/schemas/site.ts';
import { productosSchema } from '../src/schemas/productos.ts';
import { ubicacionesSchema } from '../src/schemas/ubicaciones.ts';

const esquemas = { site: siteSchema, productos: productosSchema, ubicaciones: ubicacionesSchema };
for (const [nombre, schema] of Object.entries(esquemas)) {
  const json = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' });
  fs.writeFileSync(`schemas/${nombre}.schema.json`, JSON.stringify(json, null, 2) + '\n');
  console.log(`schemas/${nombre}.schema.json`);
}
