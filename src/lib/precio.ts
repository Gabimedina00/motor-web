export function formatoPrecio(valor: number, moneda = 'ARS', idioma = 'es-AR'): string {
  return new Intl.NumberFormat(idioma, { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
    .format(valor)
    .replace(/ /g, ' ');
}
