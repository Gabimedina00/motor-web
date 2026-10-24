# motor-web

Motor para construir sitios de comercios. Hay un solo código y cada cliente es una carpeta con sus datos, textos, fotos y colores dentro de `clients/`. Si mejorás un bloque, lo reciben todos los clientes.

- Objetivo y alcance: [docs/BRIEF.md](docs/BRIEF.md)
- Arquitectura y diseño: [docs/DESIGN.md](docs/DESIGN.md)

## Qué necesitás

- [Node.js 24](https://nodejs.org/) (si usás nvm: `nvm use`, toma la versión de `.nvmrc`).
- VS Code con las extensiones recomendadas (el editor las sugiere al abrir la carpeta).

## Primeros pasos

```bash
npm install
npm run dev                                  # cliente de ejemplo (tienda) en http://localhost:4321
CLIENT=_ejemplo-servicios npm run dev        # ejemplo con turnos
CLIENT=_ejemplo-portfolio npm run dev        # ejemplo de portfolio
```

En Windows con PowerShell, la variable va así: `$env:CLIENT="_ejemplo-servicios"; npm run dev`.

## Sumar un cliente

```bash
npm run nuevo-cliente cromo-insumos tienda   # tienda | servicios | portfolio
CLIENT=cromo-insumos npm run dev
```

Después editá los archivos de `clients/cromo-insumos/`:

| Archivo | Qué tiene |
| --- | --- |
| `site.json` | Nombre, textos del inicio, colores, fuentes, WhatsApp, redes, medios de pago, preguntas frecuentes |
| `productos.json` | Categorías y productos o servicios. Cada uno tiene una o más variantes con precio (unidad, caja, bulto, combo) |
| `ubicaciones.json` | Direcciones, horarios y zonas de envío |
| `paginas/nosotros.md` | Texto largo de presentación, en Markdown |
| `fotos/` | Fotos que nombrás desde los JSON |

El editor autocompleta y marca errores en los JSON gracias a los esquemas de `schemas/`. Si cargás un precio en 0, una categoría que no existe o una foto sin texto alternativo, `npm run dev` y `npm run build` te dicen qué archivo y qué campo arreglar.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Sitio en vivo mientras editás |
| `npm run build` | Genera el sitio final en `dist/<cliente>/` |
| `npm test` | Valida los datos de todos los clientes y la lógica de pedidos y horarios |
| `npm run build:ejemplos` + `npm run test:e2e` | Prueba los tres ejemplos en un navegador real, en celular y escritorio, con revisión de accesibilidad |
| `npm run check` | Revisa los tipos de TypeScript |
| `npm run esquemas` | Regenera `schemas/*.schema.json` si cambiás los esquemas en `src/schemas/` |

## Cómo está armado

```
clients/            un cliente por carpeta (los que empiezan con _ son ejemplos)
src/schemas/        reglas de los datos (zod)
src/lib/            carga del cliente, precios, WhatsApp, horarios, marca
src/blocks/         bloques: Header, Hero, Catalogo, Carrito, Turno, Ubicaciones, FAQ...
src/themes/         qué bloques usa cada tema y en qué orden
src/pages/          arma la página con los bloques del tema
tests/              tests unitarios (vitest) y de navegador (Playwright + axe)
```

## Publicar

Cada cliente se publica como un proyecto de Cloudflare Pages conectado a este repo. Comando de build: `npm run build`. Carpeta de salida: `dist/<cliente>`. Variable de entorno: `CLIENT=<cliente>`. Versión de Node: `NODE_VERSION=24`.
