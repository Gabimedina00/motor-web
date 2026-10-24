import { expect, test } from '@playwright/test';
import { abrir, sinErroresDeAccesibilidad, SITIOS } from './ayudas';

test('muestra la galería y pasa la revisión de accesibilidad', async ({ page }) => {
  const errores = await abrir(page, SITIOS.portfolio);
  await expect(page.locator('#galeria img')).toHaveCount(6);
  await sinErroresDeAccesibilidad(page);
  expect(errores).toEqual([]);
});
