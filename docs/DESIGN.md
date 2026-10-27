# DESIGN.md: motor-web (genérico)

## Arquitectura
- Astro 7 + TypeScript, salida estática. Node 24. Sin frameworks de UI: la interactividad (carrito, horarios) en TypeScript plano.
- Todo se edita en código. Cada cliente es una carpeta en `clients/<cliente>/`:
  - `site.json`: nombre, rubro, tema, tokens de marca, contacto, WhatsApp, redes, SEO.
  - `productos.json`: catálogo (categorías, precio, variantes: unidad, caja, bulto, combo).
  - `ubicaciones.json`: direcciones, horarios, zonas de envío.
  - `paginas/nosotros.md`: texto largo de presentación (Markdown).
  - Preguntas frecuentes, testimonios y galería van en `site.json`.
  - `fotos/`: imágenes del cliente. Cada sitio publica solo las fotos de su carpeta (alias `@cliente` en `astro.config.mjs`).
- Esquemas zod en `src/schemas/` validan los datos al compilar y en `npm test`. Un precio vacío o en 0, un horario mal escrito o una foto faltante cortan el build con un mensaje claro. El editor autocompleta los JSON a partir de esos esquemas.
- `CLIENT=<cliente> npm run dev` muestra ese cliente; `npm run build` lo publica.
- `npm run nuevo-cliente <nombre> [tema]` copia el ejemplo del tema para arrancar uno nuevo.
- Ejemplos ficticios, uno por tema: `_ejemplo` (vivero, tienda), `_ejemplo-servicios` (estética, turnos), `_ejemplo-portfolio` (paisajismo).

## Capas
- `src/blocks/`: bloques reutilizables, un componente cada uno (Header, Hero, Catalogo, Carrito, Ubicaciones, Galeria, Testimonios, Contacto, FAQ, Footer).
- `src/themes/`: plantillas por tipo de negocio. Cada una elige bloques, orden y estilo por defecto:
  - `tienda`: catálogo + carrito por WhatsApp (gastronomía, insumos, ropa).
  - `servicios`: servicios + turnos por WhatsApp (estética, odontología, peluquería).
  - `portfolio`: galería y trabajos (creativos, fotógrafos, CM).
- El cliente elige un tema en `site.json` y puede sumar, sacar o reordenar bloques.

## Tokens (default del motor; cada cliente los pisa en site.json)
| Token | Default | Uso |
|---|---|---|
| brand | #2563eb | botones, precios, acentos |
| brand-strong | #1d4ed8 | hover / pressed |
| ink | #111827 | texto principal |
| muted | #6b7280 | texto secundario |
| surface | #ffffff | fondo |
| surface-alt | #f3f4f6 | secciones alternas |
| accent | #f59e0b | badges, contador del carrito |
| accent-ink | #111827 | texto sobre accent |
| brand-ink | #ffffff | texto sobre brand (en una marca clara, oscuro) |
| surface-raised | = surface-alt | hover de superficies, marco de fotos |
| line | ink al 12 % | bordes de tarjetas y separadores |
| control-border | ink al 25 % | bordes de campos, pastillas y contadores (3:1 con el fondo) |
| focus | = brand | anillo de foco |
| link | = brand-strong | enlaces y botón secundario |
| promo / promo-ink | = accent / accent-ink | "Ahorrás $…" |
| error | #b91c1c | mensajes de error |
| radius | 12px cards, 999px botones | |
| shadow | 0 2px 8px rgb(0 0 0 / .08) | cards, carrito |

- `marca.esquema: "oscuro"`: toda la página en oscuro (controles nativos incluidos). Los tokens del cliente tienen que ser los de una paleta oscura; la portada usa luces de `brand` y `accent`.

## Tipografía
- Dos fuentes por cliente: display y texto, servidas localmente con Fontsource. Disponibles: Inter, Bricolage Grotesque, Fraunces. Default: Inter para ambas. Cada sitio incluye solo las dos que usa (alias `@fuente-display` y `@fuente-texto` en `astro.config.mjs`).
- Escala: 40/32/24/20/16/14 px en desktop, 32/26/20/18/16/14 en móvil.

## Espaciado y contenedor
- Escala 4/8/12/16/24/32/48/64. Contenedor máx. 1120 px, gutter 16 px móvil / 24 px desktop.
- Mobile-first. Grilla de catálogo: 1 col < 600 px (tarjeta horizontal compacta), 2 cols ≥ 600, 3 cols ≥ 960.

## Componentes base
- Botón primario: fondo brand, texto blanco, alto mínimo 44 px, radio 999.
- Card de producto: todo en una tarjeta. Foto (opcional), nombre y etiqueta, descripción, "Ideal para", presentación, color y talle, precio grande, ahorro y botón "Agregar al pedido" (confirma "✓ Agregado" sin moverse). En celular la foto va chica al costado del nombre.
- Chip de categoría: pill, activo = brand.
- Badge: "Promo", "Combo", "Abierto ahora" / "Cerrado".

## Carrito por WhatsApp (bloque estrella)
- Cada línea muestra producto, presentación, unidades ("2 packs de 3 cajas (6 cajas en total)") y colores/talles. El mismo producto con otra presentación o color va en otra línea.
- "Subtotal de productos" y "Envío: a coordinar" por separado: el subtotal nunca incluye un envío sin cotizar.
- Reglas por cliente en `site.json > pedidos`: `mediosDePago`, `pagoConEnvio` (con envío solo se ofrecen esos), `avisoEnvio`, `localidades` (selector de zona, siempre con "Otra zona (consultar)") y `nombreRetiro` ("Retiro en el local" por defecto).
- Localidad y dirección se piden solo con envío. Si falta algo, el mensaje lo dice y el foco va al campo.
- "Continuar por WhatsApp" arma el mensaje y abre wa.me. El pedido no se vacía: abrir WhatsApp no confirma la venta.

## Calidad
- Contraste AA, `alt` obligatorio (lo exige el esquema), zoom permitido, navegable con teclado.
- SEO: canónico, Open Graph y JSON-LD generados desde los mismos datos que se muestran.
- Imágenes con `astro:assets`: WebP, tamaños responsive, carga diferida. Meta: < 1 MB en la primera carga.
- Tests Playwright para cada tema, con el cliente `_ejemplo`, en móvil y desktop. Prueban la carga, el carrito y el link de WhatsApp. Se corren en GitHub Actions junto con la auditoría Axe.

## Hosting
- GitHub (código) + Cloudflare Pages (un proyecto por cliente, gratis para uso comercial).

## Portada, cinta y metadatos
- `hero.promo`: etiqueta corta arriba del título. `hero.titulo` con `*asteriscos*`: esa parte va resaltada (en esquema oscuro, con degradé cromado). `hero.apoyo`: línea chica debajo de los botones. `hero.botonPrincipal` y `hero.botonWhatsApp` cambian los textos de los botones.
- `hero.efecto: "emblema"`: la foto es un emblema con fondo transparente. Flota suave y se inclina un poco con el mouse; con menos movimiento o en pantallas táctiles queda quieto, y todo se pausa cuando la portada sale de la vista.
- `cinta` en site.json: `{ "frases": [...], "nota"?: "...", "animada"?: true }`. Fija: frases separadas por ✦ y una nota abajo. Animada: pasa en una franja; el lector de pantalla la lee una sola vez y con menos movimiento queda quieta.
- `marca.isotipo`: el símbolo sin el nombre. Va al lado del nombre en el encabezado y es el ícono de la pestaña. `marca.logo` sigue siendo el logo completo que reemplaza al nombre. `marca.lema`: frase corta en el pie.
- `compartir`: imagen de 1200 × 630 con `alt` para WhatsApp y redes (sin ella se usa la foto de portada). Canónico, `og:url` y JSON-LD salen todos de `url`.
- `pasos`: hasta 5 pasos de "Cómo comprar" (bloque `Pasos`, con enlace en el encabezado).
- `.revelar`: las fichas y los títulos aparecen suavemente una sola vez al entrar en pantalla. Sin JavaScript o con menos movimiento se ven desde el principio.

## Catálogo, colores y talles, packs
- `aviso` en productos.json: línea arriba del catálogo ("Precios actualizados al…").
- `idealPara` en un producto: hasta 4 rubros, "Ideal para: manicura · pestañas". Es texto de venta, no un filtro.
- `opciones` en un producto:
  - `colores`: `[{ "nombre", "muestra": "#hex", "talles"?: [...] }]`. La muestra es un círculo; el nombre siempre se ve escrito. Los talles de cada color mandan: los que no hay se ven tachados.
  - `talles`: talles iguales para todo el producto (por ejemplo un combo con guantes).
  - `unidad`: `{ "singular": "caja", "plural": "cajas" }`, para hablar de packs.
  - Sin elegir lo que falta, no se agrega: la ficha dice qué falta y lleva el foco ahí.
- `unidades` en una variante: cuántas trae el pack. Con 2 o más aparece "Mismo color y talle" / "Combinar colores y talles": contadores por combinación que tienen que sumar el total del pack.
- `fondo` en un producto: color del marco de la foto (por ejemplo negro para una foto con fondo negro). Las fotos van enteras, sin recortar.
- `precioAntes` en una variante: precio tachado y "Ahorrás $…". En los selectores de presentación aparece como "(ahorrás $…)".
- Las categorías llevan número (01, 02…) y título grande. Si una categoría tiene un solo producto, en escritorio la ficha ocupa todo el ancho (foto a un lado, compra al otro).
- Atajos de categorías: marcan la sección visible mientras se baja, pero nunca mueven la página por su cuenta; solo deslizan la barra de costado para mostrar el activo.
