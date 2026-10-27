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
  // El subtotal es solo de productos: el envío se coordina aparte.
  await expect(pedido.getByText('Subtotal de productos $ 38.500')).toBeVisible();
  await expect(pedido.getByText('Envío A coordinar')).toBeVisible();

  // Con envío solo se acepta transferencia: efectivo ni aparece.
  await expect(pedido.getByLabel('Forma de pago').locator('option')).toHaveText(['Transferencia']);
  await expect(pedido.getByText('Con envío se paga con transferencia.')).toBeVisible();

  // Faltan datos: lo dice y lleva al campo.
  await pedido.getByRole('button', { name: 'Continuar por WhatsApp' }).click();
  await expect(pedido.getByRole('alert')).toHaveText(/localidad/);
  await expect(pedido.getByLabel('Localidad')).toBeFocused();
  await pedido.getByLabel('Localidad').selectOption('Fontana');
  await pedido.getByLabel('Dirección de entrega').fill('Calle Falsa 123');
  await pedido.getByRole('button', { name: 'Continuar por WhatsApp' }).click();
  await expect(pedido.getByRole('alert')).toHaveText(/tu nombre/);

  await pedido.getByLabel('Tu nombre').fill('Ana');
  await pedido.getByLabel('Aclaraciones para tu pedido (opcional)').fill('Timbre 2');
  await pedido.getByRole('button', { name: 'Continuar por WhatsApp' }).click();

  const { numero, mensaje } = await linkAbierto(page);
  expect(numero).toBe('5493624000000');
  expect(mensaje).toContain('• 2 x Monstera deliciosa (Maceta 17 cm): $ 29.000');
  expect(mensaje).toContain('• 1 x Suculentas surtidas (Bandeja x 6): $ 9.500');
  expect(mensaje).toContain('Subtotal de productos: $ 38.500');
  expect(mensaje).toContain('Localidad: Fontana');
  expect(mensaje).toContain('Dirección: Calle Falsa 123');
  expect(mensaje).toContain('Pago: Transferencia');
  expect(mensaje).toContain('Aclaraciones: Timbre 2');
  // Abrir WhatsApp no es confirmar la venta: el pedido sigue ahí.
  await expect(pedido.getByText('Subtotal de productos $ 38.500')).toBeVisible();
});

test('retiro en el local habilita efectivo y no pide dirección', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  await page.locator('[data-producto="cactus"]').getByRole('button', { name: /Agregar/ }).click();
  await page.getByRole('button', { name: /Ver tu pedido/ }).first().click();
  const pedido = page.getByRole('dialog', { name: 'Tu pedido' });
  await pedido.getByLabel('Dirección de entrega').fill('Dirección vieja 1');
  await pedido.getByLabel('Retiro en el local').check();
  await expect(pedido.getByLabel('Dirección de entrega')).toBeHidden();
  await expect(pedido.getByLabel('Localidad')).toBeHidden();
  await expect(pedido.getByText('Envío A coordinar')).toBeHidden();
  await pedido.getByLabel('Forma de pago').selectOption('Efectivo');
  await pedido.getByLabel('Tu nombre').fill('Juan');
  await pedido.getByRole('button', { name: 'Continuar por WhatsApp' }).click();
  const { mensaje } = await linkAbierto(page);
  expect(mensaje).toContain('Entrega: retiro en el local');
  expect(mensaje).toContain('Pago: Efectivo');
  expect(mensaje).not.toContain('Dirección');

  // Volver a envío con efectivo elegido deja transferencia.
  await pedido.getByLabel('Envío a domicilio').check();
  await expect(pedido.getByLabel('Forma de pago')).toHaveValue('Transferencia');
});

test('color, talle y pack mixto llegan completos al pedido', async ({ page }) => {
  await abrir(page, SITIOS.tienda);
  const ficha = page.locator('[data-producto="guantes-jardin"]');
  const agregar = ficha.getByRole('button', { name: /Agregar/ });

  // Sin elegir, no se agrega y la ficha dice qué falta.
  await agregar.click();
  await expect(ficha.getByRole('alert')).toHaveText('Elegí el color y el talle.');
  await expect(ficha.getByRole('radio', { name: 'Verde' })).toBeFocused();
  await expect(page.locator('[data-contador]').first()).toHaveText('0');

  // El talle L no existe en verde.
  await ficha.getByRole('radio', { name: 'Verde' }).check();
  await expect(ficha.getByRole('radio', { name: 'L', exact: true })).toBeDisabled();
  await ficha.getByRole('radio', { name: 'S', exact: true }).check();
  await agregar.click();

  // Pack de 3 pares combinados: tiene que sumar 3.
  await ficha.getByLabel('Presentación').selectOption({ index: 1 });
  await ficha.getByRole('radio', { name: 'Combinar colores y talles' }).check();
  await expect(ficha.getByText('Elegiste 0 de 3 pares.')).toBeVisible();
  await ficha.getByRole('button', { name: 'Negro L: sumar 1' }).click();
  await ficha.getByRole('button', { name: 'Negro L: sumar 1' }).click();
  await agregar.click();
  await expect(ficha.getByRole('alert')).toHaveText('Te falta 1 par para completar el pack de 3.');
  await ficha.getByRole('button', { name: 'Verde M: sumar 1' }).click();
  await expect(ficha.getByRole('button', { name: 'Verde S: sumar 1' })).toBeDisabled();
  await agregar.click();

  await page.getByRole('button', { name: /Ver tu pedido, 2 productos/ }).click();
  const pedido = page.getByRole('dialog', { name: 'Tu pedido' });
  await expect(pedido.getByText('1 pack de 3 pares')).toBeVisible();
  await expect(pedido.getByText('1 par Verde M + 2 pares Negro L')).toBeVisible();
  await pedido.getByRole('button', { name: 'Sumar una unidad de Guantes de jardinería, 1 par Verde M + 2 pares Negro L' }).click();
  await expect(pedido.getByText('2 packs de 3 pares (6 pares en total)')).toBeVisible();
  await expect(pedido.getByText('2 pares Verde M + 4 pares Negro L')).toBeVisible();

  await pedido.getByLabel('Retiro en el local').check();
  await pedido.getByLabel('Tu nombre').fill('Lu');
  await pedido.getByRole('button', { name: 'Continuar por WhatsApp' }).click();
  const { mensaje } = await linkAbierto(page);
  expect(mensaje).toContain('• Guantes de jardinería, 1 par: $ 3.500');
  expect(mensaje).toContain('   Verde S');
  expect(mensaje).toContain('• Guantes de jardinería, 2 packs de 3 pares (6 pares en total): $ 18.000');
  expect(mensaje).toContain('   2 pares Verde M + 4 pares Negro L');
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
