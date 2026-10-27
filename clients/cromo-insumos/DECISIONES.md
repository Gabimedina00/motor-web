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
