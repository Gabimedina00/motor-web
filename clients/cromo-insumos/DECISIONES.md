# Cromo Insumos: registro de decisiones

Registro corto para que Gabriel, Claude y ChatGPT trabajen sobre la misma versión.
Flujo: Gabriel decide el alcance, Claude implementa en la rama `cromo-insumos` y abre un PR,
ChatGPT revisa la versión publicada, Gabriel valida y mergea. Cada revisión cita el commit o PR.

## 2026-10-27 · Revisión 2 (feedback de ChatGPT)

Fuente: `Cromo_Insumos_feedback_para_Claude.md` (copia en los archivos del proyecto,
`cromo-insumos/feedback/2026-10-27-revision-chatgpt.md`). Emblema final: `Cromos logo V1.2.png`.

Decidido e implementado:
- Atajos de categorías: ya no mueven la página; solo marcan la sección visible.
- Tema oscuro cromado (paleta de la sección 5 del feedback), emblema V1.2 en la portada,
  textos de la sección 6.
- Colores y talles de guantes: los que mostraba la web (rosa S y M; celeste S, M y L;
  negro M y L; blanco M). Compresas: rosa, blanca y negra (dice la descripción).
- Combos: se elige el talle de los guantes. Los talles salen de los guantes del mismo color
  (Full negro: M y L; Full rosa: S y M).
- Packs de guantes: se pueden combinar colores y talles al precio del pack, como ya decía
  la web ("Podés combinar colores y talles"). No se cambió cómo se aplican los descuentos.
- Envío a Resistencia, Fontana, Barranqueras y Puerto Vilelas, más "Otra zona (consultar)".
  Con envío solo transferencia; con retiro, transferencia o efectivo. El retiro se llama
  "Retiro coordinado" porque no hay un local con dirección publicada.
- Dirección de revisión: https://cromo-insumos.pages.dev (canónico, og:url y JSON-LD).

Pendiente de confirmar con el comercio:
- Si los barbijos vienen en colores para elegir (la foto muestra rosa y celeste). Por ahora
  no tienen selector.
- Stock por color y talle. La web no muestra stock y no se inventa.
- Horarios de atención y de entrega (no se publican hasta tenerlos).
- Si los combos con guantes admiten otros talles.

Pendiente técnico:
- Datos `Product`/`Offer` para buscadores: no se agregaron todavía.
- Prueba en un celular real y medición de carga (Lighthouse) sobre la versión publicada.

## 2026-11-01 · Dirección de la página: cromoinsumos.com

- Se descartó el proyecto de Cloudflare Pages (`cromo-insumos.pages.dev`): nunca se creó.
- La página usa el dominio **cromoinsumos.com**. Está registrado en Hostinger (lo maneja
  Facundo, el desarrollador anterior) y vence el 23/02/2027. Sus nameservers apuntan a
  Cloudflare desde el 1/11, y se conecta al Worker `motor-web` como dominio propio (con y sin `www`).
- Canónico, og:url, JSON-LD y la imagen para compartir salen de https://cromoinsumos.com.
- El link del Worker, https://motor-web.gabrielmed1n400.workers.dev, sigue andando.

## 2026-11-02 · Franja, fotos de guantes y pie

Pedido de Gabriel:
- **Verde de Cromo**: `#a8e436` (tomado de la muestra que pasó). Es el color de acento del sitio:
  estrellas de la franja, etiquetas, palabra resaltada de la portada, links y contorno de foco.
  Reemplaza al celeste `#8bd8ee`. Los botones siguen en violeta.
- **Franja** ("Precios a la vista · Combos · Pedidos por WhatsApp"): estaba corrida a la izquierda
  (la lista perdía el centrado). Ahora está centrada, con letras más gruesas y espaciadas, una luz
  verde que recorre cada frase y estrellas que giran. En celular va una frase por renglón.
  Con "menos movimiento" activado en el teléfono no se anima.
- **Guantes por color**: al elegir un color, la foto de las cuatro cajas se acerca a la caja de ese
  color (campo `encuadre` en cada color de productos.json). Si se combinan colores, vuelve a mostrar
  todas. Si llegan fotos de cada caja por separado, conviene usarlas.
- **Pie**: leyenda profesional, íconos de WhatsApp e Instagram, contacto con número, usuario y
  dirección **Av. Ávalos 515, Resistencia, Chaco** con link a Google Maps, accesos a las secciones
  y el nombre grande de cierre.

Pendiente:
- Fotos individuales de cada caja de guantes (rosa, celeste, negra y blanca).
- Ahora hay dirección publicada: ver si el "Retiro coordinado" pasa a ser retiro en Av. Ávalos 515.

## 2026-11-03 · Todo en verde

- Pedido de Gabriel: todo lo violeta pasa al verde de Cromo `#a8e436` (botones, pedido, atajos de
  categorías, chips elegidos). Texto sobre el verde: `#0e0f12`.
- El contador del botón "Pedido" ahora es oscuro con número verde, para que se lea sobre el botón verde.
