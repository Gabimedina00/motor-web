import { describe, expect, it } from 'vitest';
import {
  claveItem,
  detalleItem,
  linkWhatsApp,
  mensajePedido,
  mensajeTurno,
  presentacionItem,
  totalPedido,
} from '../../src/lib/whatsapp';

const items = [
  { nombre: 'Potus', variante: 'Maceta 14 cm', precio: 6500, cantidad: 2 },
  { nombre: 'Cactus', precio: 2400, cantidad: 1 },
];

describe('pedido por WhatsApp', () => {
  it('suma el total', () => {
    expect(totalPedido(items)).toBe(15400);
  });

  it('arma el mensaje con productos, entrega y datos', () => {
    const mensaje = mensajePedido({
      comercio: 'Vivero',
      items,
      entrega: 'envio',
      avisoEnvio: 'se cotiza por distancia',
      pago: 'Transferencia',
      nombre: 'Ana',
      direccion: 'Calle 1',
    });
    expect(mensaje).toContain('• 2 x Potus (Maceta 14 cm): $ 13.000');
    expect(mensaje).toContain('• 1 x Cactus: $ 2.400');
    expect(mensaje).toContain('Subtotal de productos: $ 15.400');
    expect(mensaje).toContain('Entrega: envío a domicilio (se cotiza por distancia)');
    expect(mensaje).toContain('Dirección: Calle 1');
  });

  it('no pide dirección ni localidad si retira', () => {
    const mensaje = mensajePedido({
      comercio: 'Vivero',
      items,
      entrega: 'retiro',
      nombreRetiro: 'Retiro coordinado',
      localidad: 'Fontana',
      direccion: 'Calle 1',
    });
    expect(mensaje).toContain('Entrega: retiro coordinado');
    expect(mensaje).not.toContain('Dirección');
    expect(mensaje).not.toContain('Localidad');
  });

  it('con envío suma la localidad y las aclaraciones', () => {
    const mensaje = mensajePedido({ comercio: 'C', items, entrega: 'envio', localidad: 'Fontana', direccion: 'Av. 9', nota: 'Timbre 2' });
    expect(mensaje).toContain('Entrega: envío a domicilio (costo a coordinar)');
    expect(mensaje).toContain('Localidad: Fontana');
    expect(mensaje).toContain('Aclaraciones: Timbre 2');
  });

  it('codifica el mensaje en el link', () => {
    expect(linkWhatsApp('5493624000000', 'Hola! 2 x Potus')).toBe(
      'https://wa.me/5493624000000?text=Hola!%202%20x%20Potus',
    );
  });

  it('arma el mensaje de turno', () => {
    const m = mensajeTurno({ comercio: 'Estudio', servicio: 'Kapping', dia: '30/10/2026', nombre: 'Lu' });
    expect(m).toContain('Servicio: Kapping');
    expect(m).toContain('Día: 30/10/2026');
  });
});

describe('packs, colores y talles', () => {
  const unidad = { singular: 'caja', plural: 'cajas' };
  const mixto = {
    nombre: 'Guantes',
    variante: '3 cajas',
    precio: 27000,
    cantidad: 2,
    unidades: 3,
    unidad,
    eleccion: [
      { texto: 'Negro M', unidades: 2 },
      { texto: 'Rosa S', unidades: 1 },
    ],
  };

  it('dice cuántos packs y cuántas cajas son en total', () => {
    expect(presentacionItem({ ...mixto, cantidad: 1 })).toBe('1 pack de 3 cajas');
    expect(presentacionItem(mixto)).toBe('2 packs de 3 cajas (6 cajas en total)');
    expect(presentacionItem({ nombre: 'Guantes', variante: '1 caja', precio: 1, cantidad: 2, unidades: 1, unidad })).toBe('2 cajas');
  });

  it('en un pack mixto cuenta las cajas de cada color y talle', () => {
    expect(detalleItem(mixto)).toBe('4 cajas Negro M + 2 cajas Rosa S');
    expect(detalleItem({ ...mixto, cantidad: 1 })).toBe('2 cajas Negro M + 1 caja Rosa S');
    expect(detalleItem({ ...mixto, eleccion: [{ texto: 'Celeste L', unidades: 3 }] })).toBe('Celeste L');
  });

  it('no junta el mismo producto con otro color o talle', () => {
    const negro = { nombre: 'Guantes', variante: '1 caja', precio: 1, eleccion: [{ texto: 'Negro M', unidades: 1 }] };
    const rosa = { ...negro, eleccion: [{ texto: 'Rosa S', unidades: 1 }] };
    expect(claveItem(negro)).not.toBe(claveItem(rosa));
    expect(claveItem(negro)).toBe(claveItem({ ...negro }));
  });

  it('el mensaje lleva unidades y reparto', () => {
    const mensaje = mensajePedido({ comercio: 'Cromo', items: [mixto] });
    expect(mensaje).toContain('• Guantes, 2 packs de 3 cajas (6 cajas en total): $ 54.000');
    expect(mensaje).toContain('   4 cajas Negro M + 2 cajas Rosa S');
    expect(mensaje).toContain('Subtotal de productos: $ 54.000');
  });
});
