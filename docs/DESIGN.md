# DESIGN.md: motor-web (genérico)

## Arquitectura
- Astro 7 + TypeScript, salida estática. Node 24. Sin frameworks de UI: la interactividad (carrito, horarios) en TypeScript plano.
- Todo se edita en código. Cada cliente es una carpeta en `clients/<cliente>/`:
  - `site.json`: nombre, rubro, tema, tokens de marca, contacto, WhatsApp, redes, SEO.
  - `productos.json`: catálogo (categorías, precio, variantes: unidad, caja, bulto, combo).
  - `ubicaciones.json`: direcciones, horarios, zonas de envío.
  - `paginas/nosotros.md`: texto largo de presentación (Markdown).
  - Preguntas frecuentes, testimonios y galería van en `site.json`.
  - `fotos/`: imágenes del cliente.
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
| radius | 12px cards, 999px botones | |
| shadow | 0 2px 8px rgb(0 0 0 / .08) | cards, carrito |

## Tipografía
- Dos fuentes por cliente: display y texto, servidas localmente con Fontsource. Disponibles: Inter, Bricolage Grotesque, Fraunces (se suman en `src/lib/marca.ts`). Default: Inter para ambas.
- Escala: 40/32/24/20/16/14 px en desktop, 32/26/20/18/16/14 en móvil.

## Espaciado y contenedor
- Escala 4/8/12/16/24/32/48/64. Contenedor máx. 1120 px, gutter 16 px móvil / 24 px desktop.
- Mobile-first. Grilla de catálogo: 1 col < 600 px (tarjeta horizontal compacta), 2 cols ≥ 600, 3 cols ≥ 960.

## Componentes base
- Botón primario: fondo brand, texto blanco, alto mínimo 44 px, radio 999.
- Card de producto: foto (opcional; sin foto la card queda solo con texto), nombre, descripción en 2 líneas, precio (o selector de variante) y botón "Agregar".
- Chip de categoría: pill, activo = brand.
- Badge: "Promo", "Combo", "Abierto ahora" / "Cerrado".

## Carrito por WhatsApp (bloque estrella)
- Cantidades y variantes, total, envío o retiro, medio de pago, nombre y dirección.
- Reglas por cliente en site.json: medios de pago, si el envío tiene costo, texto de aviso ("el envío se cotiza por distancia").
- "Enviar pedido" arma el mensaje y abre wa.me con el número del cliente.

## Calidad
- Contraste AA, `alt` obligatorio (lo exige el esquema), zoom permitido, navegable con teclado.
- SEO: canónico, Open Graph y JSON-LD generados desde los mismos datos que se muestran.
- Imágenes con `astro:assets`: WebP, tamaños responsive, carga diferida. Meta: < 1 MB en la primera carga.
- Tests Playwright para cada tema, con el cliente `_ejemplo`, en móvil y desktop. Prueban la carga, el carrito y el link de WhatsApp. Se corren en GitHub Actions junto con la auditoría Axe.

## Hosting
- GitHub (código) + Cloudflare Pages (un proyecto por cliente, gratis para uso comercial).
