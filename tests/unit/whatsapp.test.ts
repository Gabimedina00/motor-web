import { describe, expect, it } from 'vitest';
import { linkWhatsApp, mensajePedido, mensajeTurno, totalPedido } from '../../src/lib/whatsapp';

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
    expect(mensaje).toContain('Total: $ 15.400');
    expect(mensaje).toContain('Entrega: envío a domicilio (se cotiza por distancia)');
    expect(mensaje).toContain('Dirección: Calle 1');
  });

  it('no pide dirección si retira en el local', () => {
    const mensaje = mensajePedido({ comercio: 'Vivero', items, entrega: 'retiro', direccion: 'Calle 1' });
    expect(mensaje).toContain('Entrega: retiro en el local');
    expect(mensaje).not.toContain('Dirección');
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
