import { expect, test } from '@playwright/test';
import { abrir, linkAbierto, sinErroresDeAccesibilidad, SITIOS } from './ayudas';

test('carga sin errores y pasa la revisión de accesibilidad', async ({ page }) => {
  const errores = await abrir(page, SITIOS.servicios);
  await sinErroresDeAccesibilidad(page);
  expect(errores).toEqual([]);
});

test('pide un turno por WhatsApp desde la tarjeta del servicio', async ({ page }) => {
  await abrir(page, SITIOS.servicios);
  await page.getByRole('link', { name: 'Pedir turno para Kapping' }).click();
  const form = page.locator('[data-form-turno]');
  await expect(form.getByLabel('Servicio')).toHaveValue('Kapping');
  await form.getByLabel('Día que preferís').fill('2026-10-30');
  await form.getByLabel('Tu nombre').fill('Lu');
  await form.getByRole('button', { name: 'Pedir turno por WhatsApp' }).click();
  const { numero, mensaje } = await linkAbierto(page);
  expect(numero).toBe('5493624000001');
  expect(mensaje).toContain('Servicio: Kapping');
  expect(mensaje).toContain('Día: 30/10/2026');
});
