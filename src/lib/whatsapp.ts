import { formatoPrecio } from './precio';

export interface ItemPedido {
  nombre: string;
  variante?: string;
  precio: number;
  cantidad: number;
}

export interface DatosPedido {
  comercio: string;
  items: ItemPedido[];
  entrega?: 'envio' | 'retiro';
  avisoEnvio?: string;
  pago?: string;
  nombre?: string;
  direccion?: string;
  nota?: string;
  moneda?: string;
}

export const totalPedido = (items: ItemPedido[]) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);

export function mensajePedido(p: DatosPedido): string {
  const $ = (n: number) => formatoPrecio(n, p.moneda);
  const lineas = [`Hola ${p.comercio}! Quiero hacer este pedido:`, ''];
  for (const i of p.items) {
    const variante = i.variante ? ` (${i.variante})` : '';
    lineas.push(`• ${i.cantidad} x ${i.nombre}${variante}: ${$(i.precio * i.cantidad)}`);
  }
  lineas.push('', `Total: ${$(totalPedido(p.items))}`);
  if (p.entrega === 'envio') lineas.push(`Entrega: envío a domicilio${p.avisoEnvio ? ` (${p.avisoEnvio})` : ''}`);
  if (p.entrega === 'retiro') lineas.push('Entrega: retiro en el local');
  if (p.pago) lineas.push(`Pago: ${p.pago}`);
  if (p.nombre) lineas.push(`Nombre: ${p.nombre}`);
  if (p.entrega === 'envio' && p.direccion) lineas.push(`Dirección: ${p.direccion}`);
  if (p.nota) lineas.push(`Nota: ${p.nota}`);
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
