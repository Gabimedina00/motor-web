import { expect, test } from '@playwright/test';
import { abrir, linkAbierto, sinErroresDeAccesibilidad, SITIOS } from './ayudas';

test('carga sin errores y pasa la revisión de accesibilidad', async ({ page }) => {
  const errores = await abrir(page, SITIOS.tienda);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await sinErroresDeAccesibilidad(page);
  expect(errores).toEqual([]);
});

test('arma el pedido y lo manda por WhatsApp', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  await page.locator('[data-producto="monstera"]').getByRole('button', { name: /Agregar/ }).click();
  await page.locator('[data-producto="suculentas-surtidas"] select').selectOption({ label: 'Bandeja x 6: $ 9.500' });
  await page.locator('[data-producto="suculentas-surtidas"]').getByRole('button', { name: /Agregar/ }).click();
  await page.locator('[data-producto="monstera"]').getByRole('button', { name: /Agregar/ }).click();

  await page.getByRole('button', { name: /Ver tu pedido, 3 productos/ }).click();
  const pedido = page.getByRole('dialog', { name: 'Tu pedido' });
  await expect(pedido.getByText('$ 38.500')).toBeVisible();

  // Con envío solo se acepta transferencia.
  await expect(pedido.getByRole('option', { name: 'Efectivo' })).toBeDisabled();

  await pedido.getByRole('button', { name: 'Enviar pedido por WhatsApp' }).click();
  await expect(pedido.getByRole('alert')).toHaveText(/tu nombre/);

  await pedido.getByLabel('Tu nombre').fill('Ana');
  await pedido.getByLabel('Dirección de entrega').fill('Calle Falsa 123');
  await pedido.getByRole('button', { name: 'Enviar pedido por WhatsApp' }).click();

  const { numero, mensaje } = await linkAbierto(page);
  expect(numero).toBe('5493624000000');
  expect(mensaje).toContain('• 2 x Monstera deliciosa (Maceta 17 cm): $ 29.000');
  expect(mensaje).toContain('• 1 x Suculentas surtidas (Bandeja x 6): $ 9.500');
  expect(mensaje).toContain('Total: $ 38.500');
  expect(mensaje).toContain('Dirección: Calle Falsa 123');
});

test('retiro en el local habilita efectivo y no pide dirección', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  await page.locator('[data-producto="cactus"]').getByRole('button', { name: /Agregar/ }).click();
  await page.getByRole('button', { name: /Ver tu pedido/ }).first().click();
  const pedido = page.getByRole('dialog', { name: 'Tu pedido' });
  await pedido.getByLabel('Retiro en el local').check();
  await expect(pedido.getByLabel('Dirección de entrega')).toBeHidden();
  await pedido.getByLabel('Forma de pago').selectOption('Efectivo');
  await pedido.getByLabel('Tu nombre').fill('Juan');
  await pedido.getByRole('button', { name: 'Enviar pedido por WhatsApp' }).click();
  const { mensaje } = await linkAbierto(page);
  expect(mensaje).toContain('Entrega: retiro en el local');
  expect(mensaje).toContain('Pago: Efectivo');
});

test('el pedido se guarda al recargar', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  await page.locator('[data-producto="potus"]').getByRole('button', { name: /Agregar/ }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /Ver tu pedido, 1 productos/ })).toBeVisible();
});

test('muestra si el local está abierto o cerrado', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  await expect(page.locator('#ubicaciones [data-estado]')).toHaveText(/^(Abierto|Cerrado)/);
});

test('la ficha muestra para quién es el producto', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  await expect(page.getByText('Precios actualizados al 1 de octubre')).toBeVisible();
  await expect(page.locator('[data-producto="sansevieria"] .card__ideal')).toHaveText('Ideal para: departamentos · oficinas · principiantes');
  // Un producto sin "idealPara" no muestra la línea.
  await expect(page.locator('[data-producto="potus"] .card__ideal')).toHaveCount(0);
});

test('al cambiar la presentación cambia el precio grande', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  const ficha = page.locator('[data-producto="suculentas-surtidas"]');
  await ficha.getByLabel('Presentación').selectOption({ label: 'Bandeja x 6: $ 9.500' });
  await expect(ficha.locator('[data-precio]')).toHaveText('$ 9.500');
});

test('la cinta y los precios de promo se leen bien', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  // La cinta animada es decorativa: el texto se lee una sola vez, en la versión para lectores de pantalla.
  await expect(page.locator('.cinta .solo-lectores')).toHaveText(/Envíos a domicilio\. Plantas de interior/);
  await expect(page.locator('.cinta__pista')).toHaveAttribute('aria-hidden', 'true');
  const combo = page.locator('[data-producto="combo-primera-planta"]');
  await expect(combo.locator('s')).toHaveText('Antes $ 14.000');
  await expect(combo.getByText('Ahorrás $ 1.500')).toBeVisible();
});
