import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export const SITIOS = {
  tienda: 'http://localhost:4321/',
  servicios: 'http://localhost:4322/',
  portfolio: 'http://localhost:4323/',
};

/** Abre la página registrando errores de consola y capturando lo que se abriría en WhatsApp. */
export async function abrir(page: Page, url: string) {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  await page.addInitScript(() => {
    (window as any).__abierto = [];
    window.open = (u?: string | URL) => ((window as any).__abierto.push(String(u)), null);
  });
  await page.goto(url);
  return errores;
}

export async function linkAbierto(page: Page) {
  const links: string[] = await page.evaluate(() => (window as any).__abierto);
  expect(links).toHaveLength(1);
  const url = new URL(links[0]);
  return { numero: url.pathname.slice(1), mensaje: url.searchParams.get('text') ?? '' };
}

export async function sinErroresDeAccesibilidad(page: Page) {
  // Sin animaciones: axe mide el contraste de cada texto en su estado final, no a mitad de una aparición.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const graves = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(graves.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}
