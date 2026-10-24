import { describe, expect, it } from 'vitest';
import { ahoraEn, estadoHorario, textoDias } from '../../src/lib/horarios';
import type { Horario } from '../../src/schemas/ubicaciones';

const corrido: Horario[] = [{ dias: ['lun', 'mar', 'mie', 'jue', 'vie'], abre: '09:00', cierra: '18:00' }];
const nocturno: Horario[] = [{ dias: ['vie', 'sab'], abre: '19:00', cierra: '01:30' }];

describe('horarios', () => {
  it('abierto dentro del horario', () => {
    expect(estadoHorario(corrido, 'mar', 10 * 60)).toEqual({ abierto: true, texto: 'Abierto, cierra a las 18:00' });
  });

  it('cerrado antes de abrir avisa la hora de hoy', () => {
    expect(estadoHorario(corrido, 'mar', 8 * 60).texto).toBe('Cerrado, abre hoy a las 09:00');
  });

  it('cerrado el fin de semana avisa el próximo día', () => {
    expect(estadoHorario(corrido, 'sab', 12 * 60).texto).toBe('Cerrado, abre el lunes a las 09:00');
    expect(estadoHorario(corrido, 'dom', 12 * 60).texto).toBe('Cerrado, abre mañana a las 09:00');
  });

  it('horario que pasa la medianoche sigue abierto de madrugada', () => {
    expect(estadoHorario(nocturno, 'sab', 60).abierto).toBe(true);
    expect(estadoHorario(nocturno, 'dom', 60).abierto).toBe(true);
    expect(estadoHorario(nocturno, 'dom', 2 * 60).abierto).toBe(false);
  });

  it('calcula día y hora en la zona del comercio', () => {
    // 2026-10-24 21:00 UTC = sábado 18:00 en Argentina
    expect(ahoraEn('America/Argentina/Buenos_Aires', new Date('2026-10-24T21:00:00Z'))).toEqual({ dia: 'sab', minuto: 18 * 60 });
  });

  it('agrupa días consecutivos', () => {
    expect(textoDias(['lun', 'mar', 'mie', 'jue', 'vie'])).toBe('Lunes a viernes');
    expect(textoDias(['sab', 'dom'])).toBe('Sábado, domingo');
  });
});
