import type { Dia, Horario } from '../schemas/ubicaciones';

const ORDEN: Dia[] = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const NOMBRE: Record<Dia, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miércoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sábado',
  dom: 'Domingo',
};

const minutos = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Día y minuto actuales en la zona horaria del comercio. */
export function ahoraEn(zonaHoraria: string, fecha = new Date()): { dia: Dia; minuto: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (t: string) => partes.find((p) => p.type === t)?.value ?? '';
  const dia = ORDEN[['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'))];
  return { dia, minuto: Number(valor('hour')) * 60 + Number(valor('minute')) };
}

export interface Estado {
  abierto: boolean;
  texto: string;
}

/** Calcula si está abierto. Soporta horarios que pasan la medianoche (ej. 19:00 a 01:30). */
export function estadoHorario(horarios: Horario[], dia: Dia, minuto: number): Estado {
  const hoy = ORDEN.indexOf(dia);
  const ayer = ORDEN.at(hoy - 1)!;

  for (const h of horarios) {
    const abre = minutos(h.abre);
    const cierra = minutos(h.cierra);
    const cruza = cierra <= abre;
    const abiertoHoy = h.dias.includes(dia) && minuto >= abre && (cruza || minuto < cierra);
    const sigueDeAyer = cruza && h.dias.includes(ayer) && minuto < cierra;
    if (abiertoHoy || sigueDeAyer) return { abierto: true, texto: `Abierto, cierra a las ${h.cierra}` };
  }

  for (let salto = 0; salto < 7; salto++) {
    const d = ORDEN.at((hoy + salto) % 7)!;
    const aperturas = horarios
      .filter((h) => h.dias.includes(d) && (salto > 0 || minutos(h.abre) > minuto))
      .map((h) => h.abre)
      .sort();
    if (aperturas.length) {
      const cuando = salto === 0 ? 'hoy' : salto === 1 ? 'mañana' : `el ${NOMBRE[d].toLowerCase()}`;
      return { abierto: false, texto: `Cerrado, abre ${cuando} a las ${aperturas[0]}` };
    }
  }
  return { abierto: false, texto: 'Cerrado' };
}

/** Agrupa días consecutivos para mostrar: "Lunes a viernes", "Sábado". */
export function textoDias(dias: Dia[]): string {
  const semana: Dia[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  const idx = dias.map((d) => semana.indexOf(d)).sort((a, b) => a - b);
  const consecutivos = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (idx.length > 2 && consecutivos) {
    return `${NOMBRE[semana[idx[0]]]} a ${NOMBRE[semana[idx.at(-1)!]].toLowerCase()}`;
  }
  return idx.map((i, n) => (n === 0 ? NOMBRE[semana[i]] : NOMBRE[semana[i]].toLowerCase())).join(', ');
}

const DIA_SCHEMA: Record<Dia, string> = {
  lun: 'Monday',
  mar: 'Tuesday',
  mie: 'Wednesday',
  jue: 'Thursday',
  vie: 'Friday',
  sab: 'Saturday',
  dom: 'Sunday',
};

export const horariosSchemaOrg = (horarios: Horario[]) =>
  horarios.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dias.map((d) => `https://schema.org/${DIA_SCHEMA[d]}`),
    opens: h.abre,
    closes: h.cierra,
  }));
