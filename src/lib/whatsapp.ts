import { formatoPrecio } from './precio';

/** Una combinación elegida (por ejemplo "Negro M") y cuántas unidades de ella lleva un pack. */
export interface Eleccion {
  texto: string;
  unidades: number;
}

export interface ItemPedido {
  id?: string;
  nombre: string;
  variante?: string;
  precio: number;
  cantidad: number;
  // Color y talle elegidos. En un pack mixto, una entrada por combinación.
  eleccion?: Eleccion[];
  // Para packs: cuántas unidades trae cada uno y cómo se llaman ("caja" / "cajas").
  unidades?: number;
  unidad?: { singular: string; plural: string };
}

export interface DatosPedido {
  comercio: string;
  items: ItemPedido[];
  entrega?: 'envio' | 'retiro';
  avisoEnvio?: string;
  nombreRetiro?: string;
  localidad?: string;
  pago?: string;
  nombre?: string;
  direccion?: string;
  nota?: string;
  moneda?: string;
}

export const totalPedido = (items: ItemPedido[]) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);

/** Dos ítems son el mismo solo si coinciden producto, presentación y colores/talles. */
export const claveItem = (i: Omit<ItemPedido, 'cantidad'>) =>
  JSON.stringify([i.id ?? i.nombre, i.variante ?? '', i.eleccion ?? []]);

const contar = (n: number, u: { singular: string; plural: string }) => `${n} ${n === 1 ? u.singular : u.plural}`;

/** "1 pack de 3 cajas", "2 packs de 3 cajas (6 cajas en total)" o "2 cajas". Sin unidad: la presentación. */
export function presentacionItem(i: ItemPedido): string | undefined {
  if (!i.unidad || !i.unidades) return i.variante;
  if (i.unidades === 1) return contar(i.cantidad, i.unidad);
  const packs = `${i.cantidad} ${i.cantidad === 1 ? 'pack' : 'packs'} de ${contar(i.unidades, i.unidad)}`;
  return i.cantidad > 1 ? `${packs} (${contar(i.cantidad * i.unidades, i.unidad)} en total)` : packs;
}

/** "Negro M", o en un pack mixto el total de cada combinación: "4 cajas Negro M + 2 cajas Rosa S". */
export function detalleItem(i: ItemPedido): string | undefined {
  if (!i.eleccion?.length) return undefined;
  if (i.eleccion.length === 1 || !i.unidad) return i.eleccion.map((e) => e.texto).join(' + ');
  return i.eleccion.map((e) => `${contar(e.unidades * i.cantidad, i.unidad!)} ${e.texto}`).join(' + ');
}

export function mensajePedido(p: DatosPedido): string {
  const $ = (n: number) => formatoPrecio(n, p.moneda);
  const lineas = [`Hola ${p.comercio}! Quiero hacer este pedido:`, ''];
  for (const i of p.items) {
    const subtotal = $(i.precio * i.cantidad);
    if (i.unidad && i.unidades) lineas.push(`• ${i.nombre}, ${presentacionItem(i)}: ${subtotal}`);
    else lineas.push(`• ${i.cantidad} x ${i.nombre}${i.variante ? ` (${i.variante})` : ''}: ${subtotal}`);
    const detalle = detalleItem(i);
    if (detalle) lineas.push(`   ${detalle}`);
  }
  lineas.push('', `Subtotal de productos: ${$(totalPedido(p.items))}`);
  if (p.entrega === 'envio') lineas.push(`Entrega: envío a domicilio (${p.avisoEnvio ?? 'costo a coordinar'})`);
  if (p.entrega === 'retiro') {
    const retiro = p.nombreRetiro ?? 'Retiro en el local';
    lineas.push(`Entrega: ${retiro[0].toLowerCase()}${retiro.slice(1)}`);
  }
  if (p.entrega === 'envio' && p.localidad) lineas.push(`Localidad: ${p.localidad}`);
  if (p.entrega === 'envio' && p.direccion) lineas.push(`Dirección: ${p.direccion}`);
  if (p.pago) lineas.push(`Pago: ${p.pago}`);
  if (p.nombre) lineas.push(`Nombre: ${p.nombre}`);
  if (p.nota) lineas.push(`Aclaraciones: ${p.nota}`);
  return lineas.join('\n');
}

export interface DatosTurno {
  comercio: string;
  servicio: string;
  dia?: string;
  horario?: string;
  nombre?: string;
  nota?: string;
}

export function mensajeTurno(t: DatosTurno): string {
  const lineas = [`Hola ${t.comercio}! Quiero pedir un turno.`, '', `Servicio: ${t.servicio}`];
  if (t.dia) lineas.push(`Día: ${t.dia}`);
  if (t.horario) lineas.push(`Horario: ${t.horario}`);
  if (t.nombre) lineas.push(`Nombre: ${t.nombre}`);
  if (t.nota) lineas.push(`Nota: ${t.nota}`);
  return lineas.join('\n');
}

export const linkWhatsApp = (numero: string, mensaje = '') =>
  `https://wa.me/${numero}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`;
