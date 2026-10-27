// Las dos fuentes del cliente: astro.config.mjs apunta cada alias al paquete que corresponde,
// así el sitio no carga familias que no usa.
import '@fuente-display';
import '@fuente-texto';
import type { Site, Tokens } from '../schemas/site';

// Para sumar una fuente: instalá su paquete de @fontsource-variable, sumalo en PAQUETES
// (astro.config.mjs), acá y en FUENTES (src/schemas/site.ts).
const FAMILIAS: Record<Site['marca']['fuentes']['display'], string> = {
  Inter: "'Inter Variable', system-ui, sans-serif",
  'Bricolage Grotesque': "'Bricolage Grotesque Variable', system-ui, sans-serif",
  Fraunces: "'Fraunces Variable', Georgia, serif",
};

const VARIABLES: Record<keyof Tokens, string> = {
  brand: '--brand',
  brandStrong: '--brand-strong',
  ink: '--ink',
  muted: '--muted',
  surface: '--surface',
  surfaceAlt: '--surface-alt',
  accent: '--accent',
  accentInk: '--accent-ink',
  brandInk: '--brand-ink',
  surfaceRaised: '--surface-raised',
  line: '--line',
  controlBorder: '--control-border',
  focus: '--focus',
  link: '--link',
  promo: '--promo',
  promoInk: '--promo-ink',
  error: '--error',
  radiusCard: '--radius-card',
  radiusButton: '--radius-button',
};

/** Convierte los tokens y fuentes del cliente en variables CSS que pisan las del motor. */
export function estilosMarca(marca: Site['marca']): string {
  const decl = Object.entries(marca.tokens).map(([k, v]) => `${VARIABLES[k as keyof Tokens]}: ${v};`);
  decl.push(`--font-display: ${FAMILIAS[marca.fuentes.display]};`, `--font-text: ${FAMILIAS[marca.fuentes.texto]};`);
  // html:root gana sobre el :root de motor.css sin depender del orden de carga.
  return `html:root { ${decl.join(' ')} }`;
}

/** Favicon con la inicial del comercio sobre el color de marca, para no depender de un archivo. */
export function faviconDe(site: Site): string {
  const inicial = site.nombre.trim().charAt(0).toUpperCase();
  const fondo = site.marca.tokens.brand ?? '#2563eb';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${fondo}"/>` +
    `<text x="32" y="44" font-family="system-ui,sans-serif" font-size="36" font-weight="700" fill="#fff" text-anchor="middle">${inicial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
