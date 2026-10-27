import { formatoPrecio } from '../lib/precio';
import type { Eleccion } from '../lib/whatsapp';
import type { Opciones } from '../schemas/productos';

// Lo que pasa dentro de cada ficha del catálogo: precio de la presentación elegida,
// color y talle, y el reparto de un pack mixto.

export interface Variante {
  nombre: string;
  precio: number;
  precioAntes?: number;
  unidades?: number;
}

export function varianteElegida(card: Element): Variante {
  const variantes: Variante[] = JSON.parse(card.querySelector<HTMLElement>('[data-agregar]')!.dataset.variantes!);
  const selector = card.querySelector<HTMLSelectElement>('[data-variante]');
  return variantes[selector ? Number(selector.value) : 0];
}

const opcionesDe = (caja: HTMLElement): Opciones => JSON.parse(caja.dataset.opciones!);
const contar = (n: number, u = { singular: 'unidad', plural: 'unidades' }) => `${n} ${n === 1 ? u.singular : u.plural}`;
const marcado = (caja: Element, grupo: string) =>
  caja.querySelector<HTMLInputElement>(`[data-${grupo}]:checked`)?.value;
const combinando = (caja: Element) =>
  !caja.querySelector('[data-modo]')?.hasAttribute('hidden') && marcado(caja, 'modo-opcion') === 'combinar';
const filas = (caja: Element) => [...caja.querySelectorAll<HTMLElement>('[data-combo]')];
const cuantas = (fila: Element) => Number(fila.querySelector('[data-n]')!.textContent);

function mostrarError(caja: Element, texto: string) {
  caja.querySelector('[data-opciones-error]')!.textContent = texto;
}

// El color elegido decide qué talles se pueden tocar. Un talle que ya no existe en ese color se desmarca.
function actualizarTalles(caja: HTMLElement) {
  const color = opcionesDe(caja).colores?.find((c) => c.nombre === marcado(caja, 'color'));
  caja.querySelectorAll<HTMLInputElement>('[data-talle]').forEach((r) => {
    r.disabled = Boolean(color?.talles && !color.talles.includes(r.value));
    if (r.disabled) r.checked = false;
  });
}

// Pack mixto: cuántas lleva cada combinación, sin pasarse del total del pack.
function actualizarMezcla(card: HTMLElement, caja: HTMLElement) {
  const total = varianteElegida(card).unidades ?? 1;
  const u = opcionesDe(caja).unidad;
  const suma = filas(caja).reduce((t, f) => t + cuantas(f), 0);
  filas(caja).forEach((f) => {
    f.querySelector<HTMLButtonElement>('[data-paso="-1"]')!.disabled = cuantas(f) === 0;
    f.querySelector<HTMLButtonElement>('[data-paso="1"]')!.disabled = suma >= total;
  });
  const estado = caja.querySelector('[data-mezcla-estado]');
  if (estado) estado.textContent = `Elegiste ${suma} de ${contar(total, u)}.`;
}

// Al cambiar de presentación: el reparto vuelve a cero y "Armado del pack" solo aparece si el pack trae 2 o más.
function prepararPack(card: HTMLElement, caja: HTMLElement) {
  const modo = caja.querySelector<HTMLElement>('[data-modo]');
  if (!modo) return;
  const esPack = (varianteElegida(card).unidades ?? 1) > 1;
  modo.toggleAttribute('hidden', !esPack);
  filas(caja).forEach((f) => (f.querySelector('[data-n]')!.textContent = '0'));
  mostrarModo(card, caja);
}

function mostrarModo(card: HTMLElement, caja: HTMLElement) {
  const mezcla = combinando(caja);
  caja.querySelector('[data-simple]')?.toggleAttribute('hidden', mezcla);
  caja.querySelector('[data-mezcla]')?.toggleAttribute('hidden', !mezcla);
  if (mezcla) actualizarMezcla(card, caja);
}

function actualizarPrecio(card: HTMLElement, $: (n: number) => string) {
  const v = varianteElegida(card);
  card.querySelector('[data-precio]')!.textContent = $(v.precio);
  card.querySelector('[data-ahorro]')!.toggleAttribute('hidden', !v.precioAntes);
  if (v.precioAntes) {
    card.querySelector('[data-antes]')!.textContent = $(v.precioAntes);
    card.querySelector('[data-ahorras]')!.textContent = $(v.precioAntes - v.precio);
  }
}

export function iniciarFichas() {
  const catalogo = document.querySelector<HTMLElement>('#catalogo');
  if (!catalogo) return;
  const $ = (n: number) => formatoPrecio(n, catalogo.dataset.moneda, catalogo.dataset.idioma);

  catalogo.addEventListener('change', (e) => {
    const campo = e.target as HTMLInputElement;
    const card = campo.closest<HTMLElement>('[data-producto]');
    if (!card?.querySelector('[data-agregar]')) return;
    const caja = card.querySelector<HTMLElement>('[data-opciones]');
    if (campo.matches('[data-variante]')) {
      actualizarPrecio(card, $);
      if (caja) prepararPack(card, caja);
    }
    if (!caja) return;
    if (campo.matches('[data-color]')) actualizarTalles(caja);
    if (campo.matches('[data-modo-opcion]')) mostrarModo(card, caja);
    mostrarError(caja, '');
  });

  catalogo.addEventListener('click', (e) => {
    const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-paso]');
    const fila = boton?.closest<HTMLElement>('[data-combo]');
    const card = fila?.closest<HTMLElement>('[data-producto]');
    if (!boton || !fila || !card) return;
    const caja = card.querySelector<HTMLElement>('[data-opciones]')!;
    fila.querySelector('[data-n]')!.textContent = String(Math.max(0, cuantas(fila) + Number(boton.dataset.paso)));
    mostrarError(caja, '');
    actualizarMezcla(card, caja);
  });

  catalogo.querySelectorAll<HTMLElement>('[data-opciones]').forEach((caja) => {
    const card = caja.closest<HTMLElement>('[data-producto]')!;
    actualizarTalles(caja);
    prepararPack(card, caja);
  });
}

/**
 * Lee el color, talle o reparto elegido en la ficha. Si falta algo, lo dice en la ficha,
 * lleva el foco al primer control a completar y devuelve null: el producto no se agrega.
 */
export function leerEleccion(card: HTMLElement): { eleccion?: Eleccion[] } | null {
  const caja = card.querySelector<HTMLElement>('[data-opciones]');
  if (!caja) return {};
  const op = opcionesDe(caja);
  const total = varianteElegida(card).unidades ?? 1;
  const fallar = (texto: string, foco?: HTMLElement | null) => {
    mostrarError(caja, texto);
    foco?.focus();
    return null;
  };

  if (combinando(caja)) {
    const eleccion = filas(caja)
      .map((f) => ({ texto: f.dataset.combo!, unidades: cuantas(f) }))
      .filter((x) => x.unidades > 0);
    const faltan = total - eleccion.reduce((t, x) => t + x.unidades, 0);
    if (faltan > 0) {
      const libre = caja.querySelector<HTMLButtonElement>('[data-paso="1"]:not(:disabled)');
      return fallar(`Te ${faltan === 1 ? 'falta' : 'faltan'} ${contar(faltan, op.unidad)} para completar el pack de ${total}.`, libre);
    }
    return { eleccion };
  }

  const nombreColor = marcado(caja, 'color');
  const color = op.colores?.find((c) => c.nombre === nombreColor);
  const talle = marcado(caja, 'talle');
  const pideColor = Boolean(op.colores);
  // Sin color elegido todavía, hace falta talle si algún color (o el producto) tiene talles.
  const pideTalle = color ? Boolean(color.talles ?? op.talles) : Boolean(op.talles ?? op.colores?.some((c) => c.talles));
  const sinColor = pideColor && !color;
  const sinTalle = pideTalle && !talle;
  if (sinColor || sinTalle) {
    const texto = sinColor && sinTalle ? 'Elegí el color y el talle.' : sinColor ? 'Elegí el color.' : 'Elegí el talle.';
    const grupo = sinColor ? 'color' : 'talle';
    return fallar(texto, caja.querySelector<HTMLInputElement>(`[data-${grupo}]:not(:disabled)`));
  }
  if (!pideColor && !pideTalle) return {};
  const texto = color ? [color.nombre, pideTalle && talle].filter(Boolean).join(' ') : `Talle ${talle}`;
  return { eleccion: [{ texto, unidades: total }] };
}
