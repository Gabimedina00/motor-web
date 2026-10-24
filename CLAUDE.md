# motor-web

Motor genérico de sitios para comercios (Astro 7 + TypeScript, salida estática). El dueño del repo está aprendiendo a programar: explicá los cambios en español y en términos simples.

## Reglas
- Nunca meter datos de un cliente real en `src/`. Todo lo específico va en `clients/<cliente>/`.
- Los clientes que empiezan con `_` son ejemplos ficticios que usan los tests. No borrarlos.
- Al cambiar `src/schemas/`, correr `npm run esquemas` y actualizar los ejemplos si hace falta.
- Estilos solo desde tokens (`src/styles/motor.css` y `marca.tokens` en site.json). Nada de colores sueltos en los bloques.
- Mobile-first, `alt` en toda imagen, contraste AA, zoom permitido.
- Antes de un PR: `npm test`, `npm run check`, `npm run build:ejemplos` y `npm run test:e2e`.

## Entorno en la nube de Claude
- Node 24 está en `/opt/nvm/versions/node/v24.22.1/bin` (`nvm install 24` si falta). La versión del sistema (22.22) no alcanza para Astro 7.
- Playwright: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`. No correr `playwright install`.
