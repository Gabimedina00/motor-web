// Crea un cliente nuevo copiando uno de ejemplo.
// Uso: npm run nuevo-cliente <nombre> [tienda|servicios|portfolio]
import fs from 'node:fs';

const [nombre, tema = 'tienda'] = process.argv.slice(2);
const base = { tienda: '_ejemplo', servicios: '_ejemplo-servicios', portfolio: '_ejemplo-portfolio' }[tema];

if (!nombre || !/^[a-z0-9-]+$/.test(nombre)) {
  console.error('Uso: npm run nuevo-cliente <nombre> [tienda|servicios|portfolio]');
  console.error('El nombre va en minúsculas, números y guiones. Ejemplo: npm run nuevo-cliente cromo-insumos');
  process.exit(1);
}
if (!base) {
  console.error(`Tema "${tema}" desconocido. Opciones: tienda, servicios, portfolio.`);
  process.exit(1);
}
const destino = `clients/${nombre}`;
if (fs.existsSync(destino)) {
  console.error(`Ya existe ${destino}. Elegí otro nombre o editá ese cliente.`);
  process.exit(1);
}

fs.cpSync(`clients/${base}`, destino, { recursive: true });
console.log(`Listo: ${destino} (copiado de clients/${base}).

Próximos pasos:
  1. Editá ${destino}/site.json: nombre, textos, colores, WhatsApp.
  2. Cargá productos o servicios en ${destino}/productos.json y las fotos en ${destino}/fotos/.
  3. Miralo en vivo:  CLIENT=${nombre} npm run dev`);
