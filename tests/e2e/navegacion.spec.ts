import { expect, test, type Page } from '@playwright/test';
import { abrir, SITIOS } from './ayudas';

/** Espera a que la página deje de moverse (el scroll suave terminó). */
async function quieta(page: Page) {
  let antes = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => scrollY);
    if (y === antes) return y;
    antes = y;
    await page.waitForTimeout(150);
  }
  return antes;
}

/** Distancia del título de la sección al borde de abajo de las barras fijas. */
async function separacionDelTitulo(page: Page, id: string) {
  return page.evaluate((id) => {
    const barras = Math.max(
      ...[...document.querySelectorAll('.header, .categorias')].map((b) => b.getBoundingClientRect().bottom),
    );
    return document.getElementById(id)!.getBoundingClientRect().top - barras;
  }, id);
}

test('el atajo de una categoría lleva a su sección y la marca como actual', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  const atajos = page.getByRole('navigation', { name: 'Categorías del catálogo' });
  await atajos.getByRole('link', { name: 'Macetas' }).click();
  await quieta(page);
  const separacion = await separacionDelTitulo(page, 'tit-macetas');
  // El título queda visible justo debajo de las barras, sin taparse.
  expect(separacion).toBeGreaterThanOrEqual(0);
  expect(separacion).toBeLessThan(48);
  await expect(atajos.getByRole('link', { name: 'Macetas' })).toHaveAttribute('aria-current', 'location');
  await expect(atajos.locator('[aria-current]')).toHaveCount(1);
});

test('recorrer la página no la mueve sola', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  for (const destino of ['#cat-suculentas', '#cat-sustratos', '#cat-interior']) {
    const y = await page.evaluate((d) => {
      const top = document.querySelector(d)!.getBoundingClientRect().top + scrollY - 200;
      scrollTo({ top, behavior: 'instant' });
      return scrollY;
    }, destino);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBe(y);
  }
});

test('fuera del catálogo ningún atajo queda marcado', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(300);
  await expect(page.locator('.categorias [aria-current]')).toHaveCount(0);
});

test('entrar con el enlace de una categoría muestra su título', async ({ page }) => {
  await abrir(page, `${SITIOS.tienda}#cat-combos`);
  await quieta(page);
  const separacion = await separacionDelTitulo(page, 'tit-combos');
  expect(separacion).toBeGreaterThanOrEqual(0);
  expect(separacion).toBeLessThan(48);
});

test('cambiar rápido de atajo termina en el último elegido', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  const atajos = page.getByRole('navigation', { name: 'Categorías del catálogo' });
  await atajos.getByRole('link', { name: 'Sustratos' }).click();
  await page.waitForTimeout(120);
  await atajos.getByRole('link', { name: 'Suculentas' }).click();
  await quieta(page);
  await expect(atajos.getByRole('link', { name: 'Suculentas' })).toHaveAttribute('aria-current', 'location');
  const separacion = await separacionDelTitulo(page, 'tit-suculentas');
  expect(separacion).toBeGreaterThanOrEqual(0);
  expect(separacion).toBeLessThan(48);
});
