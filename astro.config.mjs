// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const cliente = process.env.CLIENT || '_ejemplo';
if (!fs.existsSync(`./clients/${cliente}/site.json`)) {
  throw new Error(`[motor-web] No existe clients/${cliente}/site.json. Creá el cliente con: npm run nuevo-cliente ${cliente}`);
}
const { url, marca } = JSON.parse(fs.readFileSync(`./clients/${cliente}/site.json`, 'utf8'));
// Solo se incluyen las fuentes que usa el cliente (ver src/lib/marca.ts).
/** @type {Record<string, string>} */
const PAQUETES = {
  Inter: '@fontsource-variable/inter',
  'Bricolage Grotesque': '@fontsource-variable/bricolage-grotesque',
  Fraunces: '@fontsource-variable/fraunces',
};
const fuente = (nombre = 'Inter') => PAQUETES[nombre] ?? PAQUETES.Inter;

export default defineConfig({
  site: url,
  outDir: `./dist/${cliente}`,
  devToolbar: { enabled: false },
  // "@cliente" apunta solo a la carpeta del cliente que se compila: así sus fotos (y ninguna de
  // otro cliente) entran en el sitio publicado.
  vite: {
    resolve: {
      alias: {
        '@cliente': fileURLToPath(new URL(`./clients/${cliente}`, import.meta.url)),
        '@fuente-display': fuente(marca?.fuentes?.display),
        '@fuente-texto': fuente(marca?.fuentes?.texto),
      },
    },
  },
});
