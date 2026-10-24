// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';

const cliente = process.env.CLIENT || '_ejemplo';
if (!fs.existsSync(`./clients/${cliente}/site.json`)) {
  throw new Error(`[motor-web] No existe clients/${cliente}/site.json. Creá el cliente con: npm run nuevo-cliente ${cliente}`);
}
const { url } = JSON.parse(fs.readFileSync(`./clients/${cliente}/site.json`, 'utf8'));

export default defineConfig({
  site: url,
  outDir: `./dist/${cliente}`,
  devToolbar: { enabled: false },
});
