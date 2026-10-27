// Valida los datos de todos los clientes en clients/. Si alguien carga un precio en 0 o
// una categoría que no existe, este test falla antes de publicar.
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteSchema } from '../../src/schemas/site';
import { productosSchema } from '../../src/schemas/productos';
import { ubicacionesSchema } from '../../src/schemas/ubicaciones';

const clientes = fs.readdirSync('clients').filter((c) => fs.existsSync(`clients/${c}/site.json`));
const leer = (ruta: string) => JSON.parse(fs.readFileSync(ruta, 'utf8'));

describe.each(clientes)('cliente %s', (cliente) => {
  const dir = `clients/${cliente}`;

  it('site.json es válido', () => {
    expect(siteSchema.safeParse(leer(`${dir}/site.json`)).error?.issues ?? []).toEqual([]);
  });

  it.runIf(fs.existsSync(`${dir}/productos.json`))('productos.json es válido y sus fotos existen', () => {
    const datos = leer(`${dir}/productos.json`);
    expect(productosSchema.safeParse(datos).error?.issues ?? []).toEqual([]);
    for (const p of datos.productos) if (p.foto) expect(fs.existsSync(`${dir}/fotos/${p.foto}`), p.foto).toBe(true);
  });

  it.runIf(fs.existsSync(`${dir}/ubicaciones.json`))('ubicaciones.json es válido', () => {
    expect(ubicacionesSchema.safeParse(leer(`${dir}/ubicaciones.json`)).error?.issues ?? []).toEqual([]);
  });
});

describe('esquemas', () => {
  const base = leer('clients/_ejemplo/productos.json');

  it('rechaza un precio en 0', () => {
    const roto = structuredClone(base);
    roto.productos[0].variantes[0].precio = 0;
    expect(productosSchema.safeParse(roto).success).toBe(false);
  });

  it('rechaza una categoría inexistente', () => {
    const roto = structuredClone(base);
    roto.productos[0].categoria = 'no-existe';
    expect(productosSchema.safeParse(roto).success).toBe(false);
  });

  it('rechaza un precio "antes" que no es mayor que el de promo', () => {
    const roto = structuredClone(base);
    roto.productos[0].variantes[0].precioAntes = roto.productos[0].variantes[0].precio;
    expect(productosSchema.safeParse(roto).success).toBe(false);
  });

  it('rechaza un pack con "unidades" sin decir cómo se llama la unidad', () => {
    const roto = structuredClone(base);
    const guantes = roto.productos.find((p: { id: string }) => p.id === 'guantes-jardin');
    delete guantes.opciones.unidad;
    expect(productosSchema.safeParse(roto).success).toBe(false);
  });

  it('rechaza talles cargados en el color y en el producto a la vez', () => {
    const roto = structuredClone(base);
    roto.productos.find((p: { id: string }) => p.id === 'guantes-jardin').opciones.talles = ['M'];
    expect(productosSchema.safeParse(roto).success).toBe(false);
  });

  it('rechaza una foto sin alt', () => {
    const roto = structuredClone(base);
    delete roto.productos[0].alt;
    expect(productosSchema.safeParse(roto).success).toBe(false);
  });
});
